import { reportToJson, reportToMarkdown } from "../../lib/report";
import type { FlightcheckReport } from "../../lib/types";
import { download } from "../utils";

export function ReportActions({ report }: { report?: FlightcheckReport }) {
  return (
    <div className="action-row">
      <button
        disabled={!report}
        onClick={() => report && download("fiber-flightcheck-report.md", reportToMarkdown(report), "text/markdown")}
      >
        Export Markdown
      </button>
      <button
        disabled={!report}
        onClick={() => report && download("fiber-flightcheck-report.json", reportToJson(report), "application/json")}
      >
        Export JSON
      </button>
    </div>
  );
}
