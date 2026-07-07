import { ChannelTable } from "../../components/ChannelTable";
import { IssueList } from "../../components/IssueList";
import { MetricsGrid } from "../../components/MetricsGrid";
import { NodePanel, ReadinessPanel } from "../../components/ReadinessPanels";
import { StatusHero } from "../../components/StatusHero";
import type { FlightcheckReport } from "../../lib/types";
import { formatTime } from "../utils";

export function LiveReport({ report, lastChecked }: { report?: FlightcheckReport; lastChecked?: string }) {
  if (!report) {
    return (
      <section className="empty-state">
        <span className="label">Awaiting Check</span>
        <h2>No live snapshot yet.</h2>
        <p>Start FNN, keep the RPC endpoint local or trusted, then run Flightcheck.</p>
      </section>
    );
  }

  return (
    <>
      <StatusHero report={report} />
      <MetricsGrid report={report} />

      <section className="meta-strip">
        <div>
          <span>Endpoint</span>
          <strong>{report.snapshot.source}</strong>
        </div>
        <div>
          <span>Last Checked</span>
          <strong>{formatTime(lastChecked)}</strong>
        </div>
        <div>
          <span>Request</span>
          <strong>
            {report.readiness.request.amount} {report.readiness.request.asset}
          </strong>
        </div>
      </section>

      <section className="grid">
        <NodePanel report={report} />
        <ReadinessPanel report={report} />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="label">Channels</span>
            <h2>Liquidity and lifecycle</h2>
          </div>
          <span className="subtle">{report.snapshot.channels.length} total</span>
        </div>
        <ChannelTable channels={report.snapshot.channels} />
      </section>

      <section className="panel">
        <span className="label">Diagnostics</span>
        <h2>Readiness findings</h2>
        <IssueList issues={report.readiness.issues} />
      </section>
    </>
  );
}
