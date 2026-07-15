import { reportToJson, reportToMarkdown } from "../../lib/report";
import type { FlightcheckReport } from "../../lib/types";
import { download } from "../utils";

function escapeHtml(value: unknown) {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function printReport(report: FlightcheckReport) {
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) {
    window.alert("Allow popups for Fiber Flightcheck, then try Save PDF again.");
    return;
  }

  popup.opener = null;
  const { snapshot, readiness } = report;
  const channels = snapshot.channels.length
    ? snapshot.channels
        .map(
          (channel) =>
            "<tr><td>" +
            escapeHtml(channel.channelId) +
            "</td><td>" +
            escapeHtml(channel.state) +
            "</td><td>" +
            escapeHtml(channel.asset) +
            "</td><td>" +
            escapeHtml(channel.localBalance) +
            "</td><td>" +
            escapeHtml(channel.remoteBalance) +
            "</td></tr>"
        )
        .join("")
    : '<tr><td colspan="5">No channels found.</td></tr>';
  const issues = readiness.issues.length
    ? readiness.issues
        .map(
          (issue) =>
            '<article class="issue"><strong>' +
            escapeHtml(issue.code) +
            " - " +
            escapeHtml(issue.title) +
            "</strong><p>" +
            escapeHtml(issue.userMessage) +
            "</p><small>Next: " +
            escapeHtml(issue.nextAction) +
            "</small></article>"
        )
        .join("")
    : '<p class="success">No diagnostic issues detected.</p>';

  popup.document.write(
    '<!doctype html><html><head><meta charset="utf-8"><title>Fiber Flightcheck Report</title>' +
      "<style>" +
      '@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;color:#172019;font:13px/1.5 Arial,sans-serif}' +
      'header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:3px solid #20c875;padding-bottom:18px;margin-bottom:22px}' +
      'h1{font-size:28px;line-height:1.1;margin:0 0 6px}h2{font-size:17px;margin:24px 0 10px}p{margin:4px 0;color:#4d5b51}' +
      '.badge{display:inline-block;padding:6px 10px;border:1px solid #20c875;border-radius:999px;color:#08713d;font-weight:700}' +
      '.blocked{border-color:#d43f5e;color:#a51f3b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
      '.metric,.card{border:1px solid #d8dfda;border-radius:8px;padding:12px}.metric span{display:block;color:#68756c;font-size:10px;text-transform:uppercase}' +
      '.metric strong{display:block;font-size:17px;margin-top:3px}.card dl{margin:0}.card div{display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-bottom:1px solid #edf0ee}' +
      '.card div:last-child{border:0}dt{color:#68756c}dd{margin:0;text-align:right;font-weight:600;overflow-wrap:anywhere}' +
      'table{width:100%;border-collapse:collapse;font-size:11px}th,td{text-align:left;border:1px solid #d8dfda;padding:7px;overflow-wrap:anywhere}th{background:#f1f7f3}' +
      '.issue{border-left:3px solid #d43f5e;padding:8px 12px;margin:8px 0;background:#fff6f8}.issue p,.issue small{display:block;margin:3px 0}' +
      '.success{padding:10px;border-left:3px solid #20c875;background:#f0fbf5;color:#08713d}.footer{margin-top:24px;padding-top:10px;border-top:1px solid #d8dfda;color:#68756c;font-size:10px}' +
      '@media print{button{display:none}}' +
      "</style></head><body>" +
      "<header><div><h1>Fiber Flightcheck Report</h1><p>Generated " +
      escapeHtml(new Date(report.generatedAt).toLocaleString()) +
      "</p><p>Source: " +
      escapeHtml(snapshot.source) +
      '</p></div><span class="badge ' +
      (readiness.ready ? "" : "blocked") +
      '">' +
      (readiness.ready ? "PAYMENT READY" : "BLOCKED") +
      "</span></header>" +
      '<section class="grid"><div class="metric"><span>Request</span><strong>' +
      escapeHtml(readiness.request.amount) +
      " " +
      escapeHtml(readiness.request.asset) +
      '</strong></div><div class="metric"><span>Max sendable</span><strong>' +
      escapeHtml(readiness.maxSendable) +
      " " +
      escapeHtml(readiness.request.asset) +
      '</strong></div><div class="metric"><span>Max receivable</span><strong>' +
      escapeHtml(readiness.maxReceivable) +
      " " +
      escapeHtml(readiness.request.asset) +
      '</strong></div><div class="metric"><span>Next action</span><strong>' +
      escapeHtml(readiness.nextAction) +
      "</strong></div></section>" +
      '<h2>Node</h2><section class="card"><dl><div><dt>Alias</dt><dd>' +
      escapeHtml(snapshot.node?.alias) +
      "</dd></div><div><dt>Network</dt><dd>" +
      escapeHtml(snapshot.node?.network) +
      "</dd></div><div><dt>Version</dt><dd>" +
      escapeHtml(snapshot.node?.version) +
      "</dd></div><div><dt>Synced</dt><dd>" +
      (snapshot.node?.synced ? "Yes" : "Unknown") +
      "</dd></div></dl></section>" +
      '<h2>Funding</h2><section class="card"><dl><div><dt>Address</dt><dd>' +
      escapeHtml(snapshot.funding?.address) +
      "</dd></div><div><dt>On-chain balance</dt><dd>" +
      escapeHtml(snapshot.funding ? snapshot.funding.balance.toFixed(2) + " CKB" : "-") +
      "</dd></div><div><dt>Channel funding ready</dt><dd>" +
      (snapshot.funding?.enoughForChannel ? "Yes" : "No") +
      "</dd></div></dl></section>" +
      "<h2>Channels</h2><table><thead><tr><th>Channel</th><th>State</th><th>Asset</th><th>Sendable</th><th>Receivable</th></tr></thead><tbody>" +
      channels +
      "</tbody></table><h2>Findings</h2>" +
      issues +
      '<p class="footer">Generated by Fiber Flightcheck - Public identifiers are redacted by the server.</p>' +
      "</body></html>"
  );
  popup.document.close();
  popup.focus();
  window.setTimeout(() => popup.print(), 300);
}

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
      <button disabled={!report} onClick={() => report && printReport(report)}>
        Save PDF
      </button>
    </div>
  );
}
