import type { RunState } from "../types";

export function ConnectionCard({
  rpcUrl,
  amount,
  asset,
  hostedMode,
  state,
  onRpcUrl,
  onAmount,
  onAsset,
  onHostedMode,
  onRun,
}: {
  rpcUrl: string;
  amount: string;
  asset: string;
  hostedMode: boolean;
  state: RunState;
  onRpcUrl: (value: string) => void;
  onAmount: (value: string) => void;
  onAsset: (value: string) => void;
  onHostedMode: (value: boolean) => void;
  onRun: () => void;
}) {
  return (
    <section className="control-card" aria-label="Live Fiber check controls">
      <div>
        <span className="label">Live Endpoint</span>
        <h2>Run a payment readiness check</h2>
        <p>
          Use the hosted FNN backend for the live demo, or switch to custom RPC when running
          Flightcheck inside your own trusted operator environment.
        </p>
        <div className="mode-toggle" aria-label="Endpoint mode">
          <button className={hostedMode ? "active" : ""} onClick={() => onHostedMode(true)}>
            Hosted demo node
          </button>
          <button className={!hostedMode ? "active" : ""} onClick={() => onHostedMode(false)}>
            Custom RPC
          </button>
        </div>
      </div>

      <div className="form-grid">
        <label>
          Fiber RPC URL
          <input
            value={hostedMode ? "Hosted FNN backend - private server RPC" : rpcUrl}
            disabled={hostedMode}
            onChange={(event) => onRpcUrl(event.target.value)}
          />
          <small>
            {hostedMode
              ? "The app server checks its private FNN endpoint."
              : "Custom RPC must be enabled on the app server."}
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
