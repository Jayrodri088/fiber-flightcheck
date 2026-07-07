import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { buildReport } from "../lib/readiness";
import { reportToMarkdown } from "../lib/report";

const root = resolve("dist");
const port = Number(process.env.PORT ?? 4173);
const configuredRpcUrl = process.env.FIBER_RPC_URL?.trim() || "http://127.0.0.1:8227";
const allowClientRpc = process.env.ALLOW_CLIENT_RPC === "true";
const defaultAmount = Number(process.env.FLIGHTCHECK_DEFAULT_AMOUNT ?? 10);
const defaultAsset = (process.env.FLIGHTCHECK_DEFAULT_ASSET ?? "CKB").trim().toUpperCase();

type CheckBody = {
  rpcUrl?: string;
  amount?: number;
  asset?: string;
};

function selectedRpcUrl(body?: CheckBody) {
  if (allowClientRpc && body?.rpcUrl?.trim()) return body.rpcUrl.trim();
  return configuredRpcUrl;
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
