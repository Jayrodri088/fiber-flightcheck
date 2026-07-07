import type { FlightcheckReport } from "../lib/types";

export function StatusHero({ report }: { report: FlightcheckReport }) {
  const { readiness } = report;
  const primaryIssue = readiness.issues.find((issue) => issue.severity === "blocking");

  return (
    <section className={`status-hero ${readiness.ready ? "ready" : "blocked"}`}>
      <span>{readiness.ready ? "Ready" : "Blocked"}</span>
      <h2>
        {readiness.ready
          ? `This setup can pay ${readiness.request.amount} ${readiness.request.asset}.`
          : primaryIssue?.title ?? "Payment readiness failed."}
      </h2>
      <p>{readiness.nextAction}</p>
    </section>
  );
}
