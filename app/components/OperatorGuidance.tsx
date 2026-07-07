import type { FlightcheckReport } from "../../lib/types";

export function OperatorGuidance({ report }: { report?: FlightcheckReport }) {
  const blockers = report?.readiness.issues.filter((issue) => issue.severity === "blocking") ?? [];
  const warnings = report?.readiness.issues.filter((issue) => issue.severity === "warning") ?? [];

  return (
    <section className="panel guidance-panel">
      <span className="label">Operator Guidance</span>
      <h2>{report?.readiness.ready ? "Ready for payment traffic" : "What to do next"}</h2>
      {!report ? (
        <p className="muted">Run a live check to receive endpoint-specific guidance.</p>
      ) : report.readiness.ready ? (
        <div className="guidance-list">
          <p>
            Use this endpoint for payment attempts up to {report.readiness.maxSendable}{" "}
            {report.readiness.request.asset}.
          </p>
          <p>Keep monitoring channel state before larger sends or before switching assets.</p>
        </div>
      ) : (
        <div className="guidance-list">
          {[...blockers, ...warnings].map((issue) => (
            <p key={`${issue.code}-${issue.title}`}>
              <strong>{issue.code}</strong>
              {issue.nextAction}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
