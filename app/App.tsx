import { useCallback, useEffect, useRef, useState } from "react";
import { ChannelTable } from "../components/ChannelTable";
import { IssueList } from "../components/IssueList";
import { MetricsGrid } from "../components/MetricsGrid";
import { NodePanel, ReadinessPanel } from "../components/ReadinessPanels";
import { StatusHero } from "../components/StatusHero";
import { reportToJson } from "../lib/report";
import type { FlightcheckReport } from "../lib/types";
import { BrandMark } from "./components/BrandMark";
import { ConnectionCard } from "./components/ConnectionCard";
import { DemoFlow } from "./components/DemoFlow";
import { FundingPanel } from "./components/FundingPanel";
import { OperatorGuidance } from "./components/OperatorGuidance";
import { PaymentProof } from "./components/PaymentProof";
import { ReportActions } from "./components/ReportActions";
import { ScenarioLab } from "./components/ScenarioLab";
import type { RunState } from "./types";
import { formatTime } from "./utils";

type Page = "home" | "console" | "runbook";

const pages: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "console", label: "Console" },
  { id: "runbook", label: "Runbook" },
];

function pageFromHash(): Page {
  const hash = window.location.hash.replace("#", "");
  return hash === "console" || hash === "runbook" ? hash : "home";
}

function setHash(page: Page) {
  window.history.replaceState(null, "", `#${page}`);
}

function TopBar({
  page,
  onPage,
  ready,
}: {
  page: Page;
  onPage: (page: Page) => void;
  ready: boolean;
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onPage("home")} aria-label="Go to home">
        <BrandMark className="brand-mark" />
        <span>
          Fiber Flightcheck
          <small>Readiness Gateway</small>
        </span>
      </button>

      <nav className="page-tabs" aria-label="Primary navigation">
        {pages.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => onPage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <span className={`live-chip ${ready ? "ready" : ""}`}>
        <i aria-hidden="true" />
        {ready ? "Payment-ready" : "Live Fiber"}
      </span>
    </header>
  );
}

function HomePage({ onStart, report }: { onStart: () => void; report?: FlightcheckReport }) {
  const ready = Boolean(report?.readiness.ready);
  return (
    <div className="page home-page">
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">Fiber infrastructure</span>
          <h1>A pre-payment gateway for Fiber apps.</h1>
          <p>
            Flightcheck gives wallets, merchants, and operators a clear go/no-go signal before a
            Fiber payment attempt. It checks node health, channel state, liquidity, funding, and
            produces an auditable payment proof.
          </p>
          <div className="hero-actions">
            <button className="primary-action" onClick={onStart}>
              Open Console
            </button>
            <a className="secondary-action" href="https://github.com/Jayrodri088/fiber-flightcheck">
              View Repo
            </a>
          </div>
        </div>

        <aside className="product-card" aria-label="Product status preview">
          <div className="status-line">
            <span className={ready ? "dot ready" : "dot"} />
            <strong>{ready ? "READY_FOR_PAYMENT" : "AWAITING_CHECK"}</strong>
          </div>
          <div className="terminal-block">
            <code>inspect node</code>
            <code>verify channel_ready</code>
            <code>measure send capacity</code>
            <code>build payment proof</code>
          </div>
          <dl className="mini-ledger">
            <div>
              <dt>Mode</dt>
              <dd>server-gated</dd>
            </div>
            <div>
              <dt>RPC</dt>
              <dd>private</dd>
            </div>
            <div>
              <dt>Execution</dt>
              <dd>operator locked</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="value-grid">
        <article>
          <span>01</span>
          <h2>Preflight before payment</h2>
          <p>Catch missing peers, pending channels, wrong liquidity direction, and unsupported assets.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Proof over screenshots</h2>
          <p>Generate a bounded Fiber keysend dry-run proof that can be exported for demo or audit.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Mainnet-minded defaults</h2>
          <p>Private RPC, hidden peer target, redacted payment hash, cooldowns, and operator-gated execution.</p>
        </article>
      </section>
    </div>
  );
}

function ConsolePage({
  rpcUrl,
  amount,
  asset,
  liveNodeMode,
  report,
  state,
  error,
  lastChecked,
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
  report?: FlightcheckReport;
  state: RunState;
  error: string;
  lastChecked?: string;
  onRpcUrl: (value: string) => void;
  onAmount: (value: string) => void;
  onAsset: (value: string) => void;
  onLiveNodeMode: (value: boolean) => void;
  onRun: () => void;
}) {
  return (
    <div className="page console-page">
      <section className="console-head">
        <div>
          <span className="eyebrow">Operator console</span>
          <h1>Run the check. Ship the proof.</h1>
        </div>
        <div className="console-summary">
          <span>Last check</span>
          <strong>{formatTime(lastChecked)}</strong>
        </div>
      </section>

      <section className="console-grid">
        <ConnectionCard
          rpcUrl={rpcUrl}
          amount={amount}
          asset={asset}
          liveNodeMode={liveNodeMode}
          state={state}
          onRpcUrl={onRpcUrl}
          onAmount={onAmount}
          onAsset={onAsset}
          onLiveNodeMode={onLiveNodeMode}
          onRun={onRun}
        />
        <aside className={`run-card ${state}`}>
          <span className="label">Decision</span>
          <h2>{state === "idle" ? "No check yet" : state}</h2>
          <p>{error || report?.readiness.nextAction || "Start with a live Fiber check."}</p>
          <ReportActions report={report} />
        </aside>
      </section>

      {report ? (
        <>
          <StatusHero report={report} />
          <MetricsGrid report={report} />
          <section className="grid two">
            <NodePanel report={report} />
            <ReadinessPanel report={report} />
          </section>
          <PaymentProof report={report} amount={amount} asset={asset} />
          <section className="grid two">
            <FundingPanel report={report} />
            <DemoFlow report={report} />
          </section>
          <section className="panel">
            <div className="section-heading">
              <div>
                <span className="label">Channels</span>
                <h2>Lifecycle and liquidity</h2>
              </div>
              <span className="subtle">{report.snapshot.channels.length} total</span>
            </div>
            <ChannelTable channels={report.snapshot.channels} />
          </section>
          <section className="panel">
            <span className="label">Findings</span>
            <h2>What needs attention</h2>
            <IssueList issues={report.readiness.issues} />
          </section>
        </>
      ) : (
        <section className="empty-state">
          <span className="label">Console idle</span>
          <h2>No live snapshot yet.</h2>
          <p>Run Flightcheck to populate readiness, channel, funding, and proof controls.</p>
        </section>
      )}
    </div>
  );
}

function RunbookPage({ report, amount, asset }: { report?: FlightcheckReport; amount: string; asset: string }) {
  return (
    <div className="page runbook-page">
      <section className="runbook-hero">
        <span className="eyebrow">Submission runbook</span>
        <h1>Security posture, demo flow, and raw audit trail.</h1>
        <p>
          This page keeps supporting material out of the core console while still giving judges and
          operators the details they need to evaluate the infrastructure.
        </p>
      </section>

      <section className="grid two">
        <OperatorGuidance report={report} />
        <section className="panel">
          <span className="label">Public deployment rules</span>
          <h2>Safe by default</h2>
          <div className="guidance-list">
            <p><strong>Private RPC</strong> The browser talks to Flightcheck, not directly to FNN.</p>
            <p><strong>Bounded proof</strong> Public payment proof is dry-run only with a tiny cap.</p>
            <p><strong>Redacted output</strong> Target peer and full payment hashes are not shown.</p>
            <p><strong>Execution lock</strong> Live execution requires an operator token and trusted window.</p>
          </div>
        </section>
      </section>

      <section className="panel">
        <span className="label">Scenario Lab</span>
        <h2>Failure modes without breaking the live node</h2>
        <ScenarioLab amount={amount} asset={asset} />
      </section>

      <section className="panel">
        <span className="label">Raw Audit Output</span>
        <h2>Machine-readable report</h2>
        <pre className="raw-json">{report ? reportToJson(report) : "Run a live check to populate the report."}</pre>
      </section>
    </div>
  );
}

export function App() {
  const [page, setPage] = useState<Page>(() => pageFromHash());
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
    const onHash = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem("fiber.rpcUrl", rpcUrl);
    localStorage.setItem("fiber.amount", amount);
    localStorage.setItem("fiber.asset", asset);
    localStorage.setItem("fiber.liveNodeMode", String(liveNodeMode));
  }, [rpcUrl, amount, asset, liveNodeMode]);

  const navigate = useCallback((nextPage: Page) => {
    setPage(nextPage);
    setHash(nextPage);
  }, []);

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

  return (
    <main>
      <TopBar page={page} onPage={navigate} ready={Boolean(report?.readiness.ready)} />
      {page === "home" ? (
        <HomePage onStart={() => navigate("console")} report={report} />
      ) : page === "console" ? (
        <ConsolePage
          rpcUrl={rpcUrl}
          amount={amount}
          asset={asset}
          liveNodeMode={liveNodeMode}
          report={report}
          state={state}
          error={error}
          lastChecked={lastChecked}
          onRpcUrl={setRpcUrl}
          onAmount={setAmount}
          onAsset={setAsset}
          onLiveNodeMode={setLiveNodeMode}
          onRun={runCheck}
        />
      ) : (
        <RunbookPage report={report} amount={amount} asset={asset} />
      )}
    </main>
  );
}
