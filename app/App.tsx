import { useCallback, useEffect, useState } from "react";
import { reportToJson } from "../lib/report";
import type { FlightcheckReport } from "../lib/types";
import { ConnectionCard } from "./components/ConnectionCard";
import { DemoFlow } from "./components/DemoFlow";
import { FundingPanel } from "./components/FundingPanel";
import { LiveReport } from "./components/LiveReport";
import { OperatorGuidance } from "./components/OperatorGuidance";
import { ReportActions } from "./components/ReportActions";
import { ScenarioLab } from "./components/ScenarioLab";
import type { RunState } from "./types";
import { formatTime } from "./utils";

export function App() {
  const [rpcUrl, setRpcUrl] = useState(() => localStorage.getItem("fiber.rpcUrl") ?? "http://127.0.0.1:8227");
  const [amount, setAmount] = useState(() => localStorage.getItem("fiber.amount") ?? "10");
  const [asset, setAsset] = useState(() => localStorage.getItem("fiber.asset") ?? "CKB");
  const [hostedMode, setHostedMode] = useState(() => localStorage.getItem("fiber.hostedMode") !== "false");
  const [report, setReport] = useState<FlightcheckReport>();
  const [state, setState] = useState<RunState>("idle");
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<string>();

  useEffect(() => {
    localStorage.setItem("fiber.rpcUrl", rpcUrl);
    localStorage.setItem("fiber.amount", amount);
    localStorage.setItem("fiber.asset", asset);
    localStorage.setItem("fiber.hostedMode", String(hostedMode));
  }, [rpcUrl, amount, asset, hostedMode]);

  const runCheck = useCallback(async () => {
    setState("checking");
    setError("");
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rpcUrl: hostedMode ? undefined : rpcUrl, amount: Number(amount), asset }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Flightcheck request failed");
      const nextReport = payload as FlightcheckReport;
      setReport(nextReport);
      setLastChecked(new Date().toISOString());
      setState(nextReport.readiness.ready ? "ready" : "blocked");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setState("error");
    }
  }, [rpcUrl, amount, asset, hostedMode]);

  return (
    <main>
      <header>
        <a className="brand" href="#">
          <i aria-hidden="true" />
          <span>Fiber Flightcheck</span>
        </a>
        <nav aria-label="Product sections">
          <a href="#live">Live Check</a>
          <a href="#funding">Funding</a>
          <a href="#channels">Channels</a>
          <a href="#flow">Flow</a>
          <a href="#lab">Scenario Lab</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Fiber operator console</p>
          <h1>Preflight checks for payment-channel infrastructure.</h1>
          <p>
            Flightcheck connects to FNN, inspects peers, channels, liquidity, funding, and asset
            support, then turns raw node state into a decision an app can trust.
          </p>
          <div className="hero-pills" aria-label="Core checks">
            <span>RPC reachability</span>
            <span>Channel state</span>
            <span>Liquidity bounds</span>
            <span>Funding readiness</span>
          </div>
        </div>
        <aside className="hero-terminal" aria-label="Readiness flow preview">
          <span className="terminal-title">flightcheck/run</span>
          <code>connect fnn://127.0.0.1:8227</code>
          <code>inspect peers channels funding</code>
          <code>assert amount=10 asset=CKB</code>
          <strong>READY_FOR_PAYMENT</strong>
        </aside>
      </section>

      <section id="live" className="workspace">
        <ConnectionCard
          rpcUrl={rpcUrl}
          amount={amount}
          asset={asset}
          hostedMode={hostedMode}
          state={state}
          onRpcUrl={setRpcUrl}
          onAmount={setAmount}
          onAsset={setAsset}
          onHostedMode={setHostedMode}
          onRun={runCheck}
        />
        <aside className={`run-card ${state}`}>
          <span className="label">Run State</span>
          <h2>{state === "idle" ? "Ready to inspect" : state}</h2>
          <p>{error || report?.readiness.nextAction || "Use a local or trusted Fiber RPC endpoint."}</p>
          <ReportActions report={report} />
        </aside>
      </section>

      <LiveReport report={report} lastChecked={lastChecked} />
      <section id="funding" className="grid">
        <FundingPanel report={report} />
        <div id="flow">
          <DemoFlow report={report} />
        </div>
      </section>
      <div id="channels" />
      <OperatorGuidance report={report} />

      <section className="panel">
        <span className="label">Raw Snapshot</span>
        <h2>Auditable output</h2>
        <pre className="raw-json">{report ? reportToJson(report) : "Run a live check to populate the report."}</pre>
      </section>

      <section id="lab">
        <ScenarioLab amount={amount} asset={asset} />
      </section>

      <footer>
        <span>Live mode requires the app server: npm run app</span>
        <span>{formatTime(lastChecked)}</span>
      </footer>
    </main>
  );
}
