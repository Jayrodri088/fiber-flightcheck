import type { FlightcheckReport } from "../lib/types";
import { displayFiberSource } from "../app/utils";

export function NodePanel({ report }: { report: FlightcheckReport }) {
  const { snapshot } = report;
  return (
    <article className="panel">
      <span className="label">Node</span>
      <h2>{snapshot.node?.alias ?? "No node info"}</h2>
      <dl>
        <div><dt>Connection</dt><dd>{displayFiberSource(snapshot.source)}</dd></div>
        <div><dt>Network</dt><dd>{snapshot.node?.network ?? "-"}</dd></div>
        <div><dt>Chain hash</dt><dd>{snapshot.node?.chainHash ?? "-"}</dd></div>
        <div><dt>Version</dt><dd>{snapshot.node?.version ?? "-"}</dd></div>
        <div><dt>Synced</dt><dd>{snapshot.node?.synced ? "yes" : "unknown"}</dd></div>
      </dl>
    </article>
  );
}

export function ReadinessPanel({ report }: { report: FlightcheckReport }) {
  const { readiness } = report;
  return (
    <article className="panel">
      <span className="label">Readiness</span>
      <h2>{readiness.request.amount} {readiness.request.asset}</h2>
      <dl>
        <div><dt>Max sendable</dt><dd>{readiness.maxSendable}</dd></div>
        <div><dt>Max receivable</dt><dd>{readiness.maxReceivable}</dd></div>
        <div><dt>Assets</dt><dd>{readiness.supportedAssets.join(", ") || "-"}</dd></div>
        <div><dt>Next action</dt><dd>{readiness.nextAction}</dd></div>
      </dl>
    </article>
  );
}
