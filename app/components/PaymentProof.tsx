import { useEffect, useState } from "react";
import type { FlightcheckReport } from "../../lib/types";
import { download } from "../utils";

type ProofState = "idle" | "running" | "ready" | "error";

type ProofPolicy = {
  enabled: boolean;
  asset: string;
  maxCkb: number;
  cooldownMs: number;
  liveExecutionEnabled: boolean;
};

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

const fallbackPolicy: ProofPolicy = {
  enabled: true,
  asset: "CKB",
  maxCkb: 0.05,
  cooldownMs: 60_000,
  liveExecutionEnabled: false,
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
  const [policy, setPolicy] = useState<ProofPolicy>(fallbackPolicy);
  const [proofAmount, setProofAmount] = useState("0.01");

  const numericProofAmount = Number(proofAmount);
  const amountIsValid =
    Number.isFinite(numericProofAmount) &&
    numericProofAmount > 0 &&
    numericProofAmount <= policy.maxCkb;
  const assetIsSupported = asset === policy.asset;
  const canRun =
    Boolean(report?.readiness.ready) &&
    policy.enabled &&
    assetIsSupported &&
    amountIsValid &&
    state !== "running";

  useEffect(() => {
    let active = true;

    void fetch("/api/payment-proof")
      .then(async (response) => {
        if (!response.ok) throw new Error("Payment proof policy is unavailable.");
        return (await response.json()) as ProofPolicy;
      })
      .then((nextPolicy) => {
        if (!active) return;
        setPolicy(nextPolicy);
        setProofAmount((current) => {
          const currentAmount = Number(current);
          if (currentAmount > 0 && currentAmount <= nextPolicy.maxCkb) return current;
          return String(Math.min(0.01, nextPolicy.maxCkb));
        });
      })
      .catch(() => {
        // The fallback is intentionally conservative for older deployments.
      });

    return () => {
      active = false;
    };
  }, []);

  async function runProof() {
    if (!canRun) return;

    setState("running");
    setError("");
    try {
      const response = await fetch("/api/payment-proof", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: numericProofAmount, asset: policy.asset }),
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

  function updateProofAmount(value: string) {
    setProofAmount(value);
    setError("");
    if (state === "error") setState("idle");
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
        Readiness and proof use separate amounts. Your {amount} {asset} request checks available
        capacity, while this bounded keysend dry-run uses a small operator-capped amount.
      </p>

      <div className="proof-control-row">
        <label className="proof-amount">
          Proof amount ({policy.asset})
          <input
            type="number"
            inputMode="decimal"
            min="0.00000001"
            max={policy.maxCkb}
            step="0.01"
            value={proofAmount}
            onChange={(event) => updateProofAmount(event.target.value)}
          />
          <small>Public cap: {policy.maxCkb} {policy.asset}. This does not change the readiness request.</small>
        </label>

        <div className="proof-actions">
          <button className="primary-action" disabled={!canRun} onClick={runProof}>
            {state === "running" ? "Building Proof" : "Run Payment Proof"}
          </button>
          <button disabled={!proof} onClick={exportProof}>
            Export Proof
          </button>
        </div>
      </div>

      {!report?.readiness.ready && (
        <p className="panel-note warning-note">
          Run Flightcheck first. Payment proof starts only after the node is reachable, synced,
          funded, and has enough send liquidity for the readiness request.
        </p>
      )}

      {!assetIsSupported && report?.readiness.ready && (
        <p className="panel-note warning-note">
          This deployment currently produces payment proofs for {policy.asset} only.
        </p>
      )}

      {!amountIsValid && (
        <p className="panel-note warning-note">
          Enter a proof amount greater than 0 and no more than {policy.maxCkb} {policy.asset}.
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
            <span>Proof request</span>
            <strong>
              {proof.amount} {proof.asset}
            </strong>
            <p>Readiness request: {amount} {asset}</p>
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
