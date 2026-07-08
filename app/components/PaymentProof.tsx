import { useState } from "react";
import type { FlightcheckReport } from "../../lib/types";
import { download } from "../utils";

type ProofState = "idle" | "running" | "ready" | "error";

type PaymentProofResult = {
  proofReady: boolean;
  mode: "dry-run" | "executed";
  amount: number;
  asset: string;
  target: string;
  security: {
    serverConfiguredRpcOnly: boolean;
    clientRpcAllowed: boolean;
    maxCkb: number;
    liveExecutionEnabled: boolean;
    liveExecutionRequiresToken: boolean;
    rawPeerHidden: boolean;
  };
  dryRun: {
    status: string;
    paymentHash?: string;
    fee?: string;
    failedError?: string;
  };
  execution?: {
    status: string;
    paymentHash?: string;
    fee?: string;
    failedError?: string;
  };
  nextAction: string;
  generatedAt: string;
};

export function PaymentProof({
  report,
  amount,
  asset,
}: {
  report?: FlightcheckReport;
  amount: string;
  asset: string;
}) {
  const [state, setState] = useState<ProofState>("idle");
  const [proof, setProof] = useState<PaymentProofResult>();
  const [error, setError] = useState("");

  const canRun = Boolean(report?.readiness.ready) && state !== "running";

  async function runProof() {
    setState("running");
    setError("");
    try {
      const response = await fetch("/api/payment-proof", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), asset }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.nextAction ?? payload.message ?? payload.error ?? "Payment proof failed");
      }
      setProof(payload as PaymentProofResult);
      setState("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setState("error");
    }
  }

  function exportProof() {
    if (!proof) return;
    download(
      `fiber-payment-proof-${new Date(proof.generatedAt).toISOString().replace(/[:.]/g, "-")}.json`,
      JSON.stringify(proof, null, 2),
      "application/json"
    );
  }

  return (
    <section className={`payment-proof panel ${state}`}>
      <div className="section-heading">
        <div>
          <span className="label">Payment Proof</span>
          <h2>Prove the node can prepare a Fiber payment</h2>
        </div>
        <span className="proof-mode">{proof?.mode ?? "dry-run gated"}</span>
      </div>

      <p className="muted">
        Runs a bounded keysend dry-run against the operator-configured peer. The browser never sees
        the private FNN RPC URL, the target peer is hidden, and live execution stays disabled unless
        an operator unlocks it for a trusted demo window.
      </p>

      <div className="proof-actions">
        <button className="primary-action" disabled={!canRun} onClick={runProof}>
          {state === "running" ? "Building Proof" : "Run Payment Proof"}
        </button>
        <button disabled={!proof} onClick={exportProof}>
          Export Proof
        </button>
      </div>

      {!report?.readiness.ready && (
        <p className="panel-note warning-note">
          Run Flightcheck first. Payment proof only starts after the node is reachable, synced,
          funded, and has enough send liquidity for the selected amount.
        </p>
      )}

      {error && <p className="panel-note warning-note">{error}</p>}

      {proof && (
        <div className="proof-grid">
          <article>
            <span>Status</span>
            <strong>{proof.dryRun.status}</strong>
            <p>{proof.nextAction}</p>
          </article>
          <article>
            <span>Request</span>
            <strong>
              {proof.amount} {proof.asset}
            </strong>
            <p>Target: {proof.target}</p>
          </article>
          <article>
            <span>Payment hash</span>
            <strong>{proof.dryRun.paymentHash ?? "-"}</strong>
            <p>Fee: {proof.dryRun.fee ?? "0x0"}</p>
          </article>
          <article>
            <span>Security posture</span>
            <strong>{proof.security.liveExecutionEnabled ? "operator execution available" : "dry-run only"}</strong>
            <p>
              Server RPC only, hidden peer, max {proof.security.maxCkb} CKB per proof.
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
