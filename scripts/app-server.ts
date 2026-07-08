import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { execFile } from "node:child_process";
import { extname, join, normalize, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { buildReport } from "../lib/readiness";
import { reportToMarkdown } from "../lib/report";

const root = resolve("dist");
const port = Number(process.env.PORT ?? 4173);
const execFileAsync = promisify(execFile);
const configuredRpcUrl = process.env.FIBER_RPC_URL?.trim() || "http://127.0.0.1:8227";
const allowClientRpc = process.env.ALLOW_CLIENT_RPC === "true";
const defaultAmount = Number(process.env.FLIGHTCHECK_DEFAULT_AMOUNT ?? 10);
const defaultAsset = (process.env.FLIGHTCHECK_DEFAULT_ASSET ?? "CKB").trim().toUpperCase();
const fnnCliPath = process.env.FNN_CLI_PATH?.trim() || "fnn-cli";
const paymentProofTarget = process.env.PAYMENT_PROOF_TARGET_PUBKEY?.trim() || "";
const paymentProofEnabled = process.env.PAYMENT_PROOF_ENABLED === "true";
const paymentExecutionEnabled = process.env.PAYMENT_EXECUTION_ENABLED === "true";
const paymentExecutionToken = process.env.PAYMENT_EXECUTION_TOKEN?.trim() || "";
const paymentProofMaxCkb = Number(process.env.PAYMENT_PROOF_MAX_CKB ?? 1);
const paymentProofCooldownMs = Number(process.env.PAYMENT_PROOF_COOLDOWN_MS ?? 60_000);
let lastPaymentProofAt = 0;

type CheckBody = {
  rpcUrl?: string;
  amount?: number;
  asset?: string;
  execute?: boolean;
  executionToken?: string;
};

function selectedRpcUrl(body?: CheckBody) {
  if (allowClientRpc && body?.rpcUrl?.trim()) return body.rpcUrl.trim();
  return configuredRpcUrl;
}

function ckbToShannons(amount: number) {
  return Math.round(amount * 100_000_000);
}

function redactHash(value?: string) {
  if (!value || value.length <= 18) return value ?? "";
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

async function runFnnPayment({
  amount,
  dryRun,
}: {
  amount: number;
  dryRun: boolean;
}) {
  const args = [
    "payment",
    "send_payment",
    "--url",
    configuredRpcUrl,
    "--target-pubkey",
    paymentProofTarget,
    "--amount",
    String(ckbToShannons(amount)),
    "--keysend",
    "true",
    "--dry-run",
    String(dryRun),
    "--timeout",
    "15",
    "--output-format",
    "json",
    "--no-banner",
  ];
  const { stdout } = await execFileAsync(fnnCliPath, args, { timeout: 30_000 });
  return JSON.parse(stdout) as {
    payment_hash?: string;
    status?: string;
    fee?: string;
    failed_error?: string | null;
  };
}

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function json(status: number, payload: unknown) {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload, null, 2),
  };
}

async function readJsonBody(request: IncomingMessage): Promise<CheckBody> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as CheckBody;
}

async function handleCheck(request: IncomingMessage) {
  const body = await readJsonBody(request);
  const rpcUrl = selectedRpcUrl(body);
  const amount = Number(body.amount ?? defaultAmount);
  const asset = (body.asset?.trim() || defaultAsset).toUpperCase();

  if (!Number.isFinite(amount) || amount <= 0) {
    return json(400, { error: "amount must be a positive number" });
  }

  const snapshot = await fetchFiberSnapshot(rpcUrl);
  const report = buildReport(snapshot, { amount, asset });
  return json(200, report);
}

async function handleHealth() {
  const snapshot = await fetchFiberSnapshot(configuredRpcUrl);
  const report = buildReport(snapshot, { amount: defaultAmount, asset: defaultAsset });
  return json(200, {
    ok: snapshot.reachable,
    configuredRpc: configuredRpcUrl,
    clientRpcAllowed: allowClientRpc,
    network: snapshot.node?.network ?? "unknown",
    chainHash: snapshot.node?.chainHash,
    synced: snapshot.node?.synced ?? false,
    channels: snapshot.channels.length,
    openChannels: snapshot.channels.filter((channel) => channel.state === "OPEN").length,
    peers: snapshot.peers.length,
    paymentReady: report.readiness.ready,
    nextAction: report.readiness.nextAction,
    generatedAt: report.generatedAt,
  });
}

async function handlePaymentProof(request: IncomingMessage) {
  const body = await readJsonBody(request);
  const amount = Number(body.amount ?? defaultAmount);
  const asset = (body.asset?.trim() || defaultAsset).toUpperCase();
  const execute = body.execute === true;

  if (!paymentProofEnabled) {
    return json(403, {
      enabled: false,
      message: "Payment proof is disabled on this deployment.",
      nextAction: "Set PAYMENT_PROOF_ENABLED=true on a trusted operator deployment.",
    });
  }

  if (!paymentProofTarget) {
    return json(400, {
      enabled: true,
      message: "Payment proof target peer is not configured.",
      nextAction: "Set PAYMENT_PROOF_TARGET_PUBKEY to a trusted Fiber peer.",
    });
  }

  if (asset !== "CKB") {
    return json(400, { error: "payment proof currently supports CKB only" });
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > paymentProofMaxCkb) {
    return json(400, { error: `amount must be between 0 and ${paymentProofMaxCkb} CKB` });
  }

  const now = Date.now();
  if (now - lastPaymentProofAt < paymentProofCooldownMs) {
    return json(429, {
      error: "payment proof cooldown active",
      retryAfterMs: paymentProofCooldownMs - (now - lastPaymentProofAt),
    });
  }

  const snapshot = await fetchFiberSnapshot(configuredRpcUrl);
  const report = buildReport(snapshot, { amount, asset });
  if (!report.readiness.ready) {
    return json(409, {
      proofReady: false,
      readiness: report.readiness,
      nextAction: report.readiness.nextAction,
    });
  }

  if (execute && (!paymentExecutionEnabled || !paymentExecutionToken)) {
    return json(403, {
      proofReady: true,
      mode: "dry-run",
      message: "Live execution is disabled on this deployment.",
      nextAction: "Enable PAYMENT_EXECUTION_ENABLED and set PAYMENT_EXECUTION_TOKEN only during a trusted judging or operator window.",
    });
  }

  if (execute && body.executionToken !== paymentExecutionToken) {
    return json(403, {
      proofReady: true,
      mode: "dry-run",
      message: "Live execution token was missing or invalid.",
      nextAction: "Run the dry-run proof publicly, or use the operator token only in a trusted session.",
    });
  }

  let dryRunResult: Awaited<ReturnType<typeof runFnnPayment>>;
  let executionResult: Awaited<ReturnType<typeof runFnnPayment>> | undefined;
  const liveExecution = execute && paymentExecutionEnabled;
  try {
    dryRunResult = await runFnnPayment({ amount, dryRun: true });
    executionResult = liveExecution ? await runFnnPayment({ amount, dryRun: false }) : undefined;
  } catch {
    return json(502, {
      proofReady: false,
      message: "Payment proof command failed.",
      nextAction: "Confirm fnn-cli is installed, the target peer is connected, and the configured channel has enough send liquidity.",
    });
  }
  lastPaymentProofAt = Date.now();

  return json(200, {
    proofReady: true,
    mode: liveExecution ? "executed" : "dry-run",
    amount,
    asset,
    target: "configured Fiber peer",
    security: {
      serverConfiguredRpcOnly: true,
      clientRpcAllowed: allowClientRpc,
      maxCkb: paymentProofMaxCkb,
      liveExecutionEnabled: paymentExecutionEnabled,
      liveExecutionRequiresToken: true,
      rawPeerHidden: true,
    },
    dryRun: {
      status: dryRunResult.status ?? "unknown",
      paymentHash: redactHash(dryRunResult.payment_hash),
      fee: dryRunResult.fee,
      failedError: dryRunResult.failed_error ?? undefined,
    },
    execution: executionResult
      ? {
          status: executionResult.status ?? "unknown",
          paymentHash: redactHash(executionResult.payment_hash),
          fee: executionResult.fee,
          failedError: executionResult.failed_error ?? undefined,
        }
      : undefined,
    nextAction: liveExecution
      ? "Live payment proof submitted through Fiber."
      : "Dry-run route/payment proof succeeded. Live execution is operator-gated.",
    generatedAt: new Date().toISOString(),
  });
}

async function handleMarkdownReport(request: IncomingMessage) {
  const check = await handleCheck(request);
  if (check.status !== 200) return check;
  return {
    status: 200,
    headers: { "content-type": "text/markdown; charset=utf-8" },
    body: reportToMarkdown(JSON.parse(check.body)),
  };
}

async function serveStatic(pathname: string) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const fullPath = normalize(join(root, requested));

  if (!fullPath.startsWith(root) || !existsSync(fullPath)) {
    return json(404, { error: "not found" });
  }

  const body = await readFile(fullPath);
  const type = contentTypes[extname(fullPath)] ?? "application/octet-stream";
  return { status: 200, headers: { "content-type": type }, body };
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const route = `${request.method ?? "GET"} ${url.pathname}`;
    const result =
      route === "POST /api/check"
        ? await handleCheck(request)
        : route === "POST /api/payment-proof"
          ? await handlePaymentProof(request)
        : route === "POST /api/report.md"
          ? await handleMarkdownReport(request)
          : route === "GET /api/health"
            ? await handleHealth()
          : await serveStatic(url.pathname);

    response.writeHead(result.status, result.headers);
    response.end(result.body);
  } catch (error) {
    const result = json(500, { error: error instanceof Error ? error.message : String(error) });
    response.writeHead(result.status, result.headers);
    response.end(result.body);
  }
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(`Open http://127.0.0.1:${port} if Fiber Flightcheck is already running.`);
    console.error("Or stop the existing process / set a different PORT before running again.");
    process.exit(1);
  }
  throw error;
});

server.listen(port, () => {
  console.log(`Fiber Flightcheck app listening on http://127.0.0.1:${port}`);
  console.log(`Fiber RPC target: ${configuredRpcUrl}`);
  console.log(`Client RPC override: ${allowClientRpc ? "enabled" : "disabled"}`);
});
