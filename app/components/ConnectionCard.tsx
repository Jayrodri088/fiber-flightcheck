import type { RunState } from "../types";

export function ConnectionCard({
  rpcUrl,
  amount,
  asset,
  liveNodeMode,
  state,
  onRpcUrl,
  onAmount,
  onAsset,
  onLiveNodeMode,
  onRun,
}: {
  rpcUrl: string;
  amount: string;
  asset: string;
  liveNodeMode: boolean;
  state: RunState;
  onRpcUrl: (value: string) => void;
  onAmount: (value: string) => void;
  onAsset: (value: string) => void;
  onLiveNodeMode: (value: boolean) => void;
  onRun: () => void;
}) {
  return (
    <section className="control-card" aria-label="Live Fiber check controls">
      <div>
        <span className="label">Fiber Node</span>
        <h2>Run a payment readiness check</h2>
        <p>
          Check whether the active Fiber node has the peers, channels, liquidity, and funding
          needed to satisfy this payment request.
        </p>
        <div className="mode-toggle" aria-label="Endpoint mode">
          <button className={liveNodeMode ? "active" : ""} onClick={() => onLiveNodeMode(true)}>
            Live node
          </button>
          <button className={!liveNodeMode ? "active" : ""} onClick={() => onLiveNodeMode(false)}>
            Custom RPC
          </button>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Fiber RPC URL
          <input
            value={liveNodeMode ? "Active Fiber node" : rpcUrl}
            disabled={liveNodeMode}
            onChange={(event) => onRpcUrl(event.target.value)}
          />
          <small>
            {liveNodeMode
              ? "Using the configured Fiber node for this deployment."
              : "Use only a local or trusted FNN JSON-RPC endpoint."}
          </small>
        </label>
        <label>
          Amount
          <input value={amount} inputMode="decimal" onChange={(event) => onAmount(event.target.value)} />
        </label>
        <label>
          Asset
          <input value={asset} onChange={(event) => onAsset(event.target.value.toUpperCase())} />
        </label>
        <button className="primary-action" disabled={state === "checking"} onClick={onRun}>
          {state === "checking" ? "Checking..." : "Run Flightcheck"}
        </button>
      </div>
    </section>
  );
}
