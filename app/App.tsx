import { useCallback, useEffect, useRef, useState } from "react";
import { reportToJson } from "../lib/report";
import type { FlightcheckReport } from "../lib/types";
import { BrandMark } from "./components/BrandMark";
import { ConnectionCard } from "./components/ConnectionCard";
import { DemoFlow } from "./components/DemoFlow";
import { FundingPanel } from "./components/FundingPanel";
import { LiveReport } from "./components/LiveReport";
import { OperatorGuidance } from "./components/OperatorGuidance";
import { PaymentProof } from "./components/PaymentProof";
import { ReportActions } from "./components/ReportActions";
import { ScenarioLab } from "./components/ScenarioLab";
import { UserPath } from "./components/UserPath";
import type { RunState } from "./types";
import { formatTime } from "./utils";

export function App() {
  const [rpcUrl, setRpcUrl] = useState(() => localStorage.getItem("fiber.rpcUrl") ?? "http://127.0.0.1:8227");
  const [amount, setAmount] = useState(() => localStorage.getItem("fiber.amount") ?? "10");
  const [asset, setAsset] = useState(() => localStorage.getItem("fiber.asset") ?? "CKB");
  const [liveNodeMode, setLiveNodeMode] = useState(() => localStorage.getItem("fiber.liveNodeMode") !== "false");
  const [report, setReport] = useState<FlightcheckReport>();
  const [state, setState] = useState<RunState>("idle");
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<string>();
  const initialLiveCheck = useRef(false);

  useEffect(() => {
    localStorage.setItem("fiber.rpcUrl", rpcUrl);
    localStorage.setItem("fiber.amount", amount);
    localStorage.setItem("fiber.asset", asset);
    localStorage.setItem("fiber.liveNodeMode", String(liveNodeMode));
  }, [rpcUrl, amount, asset, liveNodeMode]);

  const runCheck = useCallback(async () => {
    setState("checking");
    setError("");
    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rpcUrl: liveNodeMode ? undefined : rpcUrl, amount: Number(amount), asset }),
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
  }, [rpcUrl, amount, asset, liveNodeMode]);

  useEffect(() => {
    if (initialLiveCheck.current || !liveNodeMode) return;
    initialLiveCheck.current = true;
    void runCheck();
  }, [liveNodeMode, runCheck]);

  const liveStatus =
    state === "checking"
      ? "Checking node"
      : report?.readiness.ready
        ? "Payment-ready"
        : report
          ? "Action needed"
          : "Live network";

  return (
    <main>
      <header>
        <a className="brand" href="#">
          <BrandMark className="brand-mark" />
          <span>
            Fiber Flightcheck
            <small>Payment readiness console</small>
          </span>
        </a>
        <nav aria-label="Product sections">
          <a href="#live">Live Check</a>
          <a href="#funding">Funding</a>
          <a href="#proof">Proof</a>
          <a href="#channels">Channels</a>
          <a href="#flow">Flow</a>
          <a href="#lab">Scenario Lab</a>
        </nav>
        <span className={`live-chip ${report?.readiness.ready ? "ready" : ""}`}>
          <i aria-hidden="true" />
          {liveStatus}
        </span>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Fiber operator console</p>
          <h1>Know if your Fiber node can pay before your app tries.</h1>
          <p>
            Flightcheck inspects FNN reachability, channel lifecycle, CKB liquidity, peers, and
            asset support, then returns the exact go/no-go signal a production app needs. To check
            your own node, run Flightcheck beside your FNN and keep RPC access private.
          </p>
          <div className="hero-pills" aria-label="Core checks">
            <span>Fiber nodes</span>
            <span>Fiber channels</span>
            <span>ChannelReady</span>
            <span>CKB liquidity</span>
            <span>Report export</span>
          </div>
        </div>
        <aside className="hero-terminal" aria-label="Readiness flow preview">
          <span className="terminal-title">flightcheck/run</span>
          <code>connect fiber-node</code>
          <code>inspect peers channels funding</code>
          <code>assert amount=10 asset=CKB</code>
          <strong>READY_FOR_PAYMENT</strong>
        </aside>
      </section>

      <UserPath />

      <section id="live" className="workspace">
        <ConnectionCard
          rpcUrl={rpcUrl}
          amount={amount}
          asset={asset}
          liveNodeMode={liveNodeMode}
          state={state}
          onRpcUrl={setRpcUrl}
          onAmount={setAmount}
          onAsset={setAsset}
          onLiveNodeMode={setLiveNodeMode}
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
      <section id="proof">
        <PaymentProof report={report} amount={amount} asset={asset} />
      </section>
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
