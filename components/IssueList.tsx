import type { DiagnosticIssue } from "../lib/types";

function IssueCard({ issue }: { issue: DiagnosticIssue }) {
  return (
    <article className={`issue ${issue.severity}`}>
      <div>
        <span>{issue.severity}</span>
        <strong>{issue.title}</strong>
      </div>
      <p>{issue.userMessage}</p>
      <code>{issue.code}</code>
      <small>{issue.nextAction}</small>
    </article>
  );
}

export function IssueList({ issues }: { issues: DiagnosticIssue[] }) {
  if (issues.length === 0) {
    return <p className="success">No issues detected. This setup is ready for the requested payment.</p>;
  }
  return (
    <div className="issues">
      {issues.map((issue) => (
        <IssueCard issue={issue} key={`${issue.code}-${issue.title}`} />
      ))}
    </div>
  );
}
