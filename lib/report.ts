import type { FlightcheckReport } from "./types";

export function reportToMarkdown(report: FlightcheckReport): string {
  const { snapshot, readiness } = report;
  const lines = [
    "# Fiber Flightcheck Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Source: ${snapshot.source}`,
    "",
    "## Summary",
    "",
    `- Ready: ${readiness.ready ? "YES" : "NO"}`,
    `- Request: ${readiness.request.amount} ${readiness.request.asset}`,
    `- Max sendable: ${readiness.maxSendable} ${readiness.request.asset}`,
    `- Max receivable: ${readiness.maxReceivable} ${readiness.request.asset}`,
    `- Supported assets: ${readiness.supportedAssets.join(", ") || "none"}`,
    `- Next action: ${readiness.nextAction}`,
    "",
    "## Node",
    "",
    `- Reachable: ${snapshot.reachable ? "YES" : "NO"}`,
    `- Alias: ${snapshot.node?.alias ?? "-"}`,
    `- Node ID: ${snapshot.node?.nodeId ?? "-"}`,
    `- Network: ${snapshot.node?.network ?? "-"}`,
    `- Chain hash: ${snapshot.node?.chainHash ?? "-"}`,
    `- Version: ${snapshot.node?.version ?? "-"}`,
    `- Synced: ${snapshot.node?.synced ? "YES" : "UNKNOWN"}`,
    "",
    "## Funding",
    "",
    `- Address: ${snapshot.funding?.address ?? "-"}`,
    `- Balance: ${snapshot.funding ? `${snapshot.funding.balance} CKB` : "-"}`,
    `- Minimum channel funding: ${snapshot.funding?.minimumChannelFunding ?? "-"} CKB`,
    `- Recommended balance: ${snapshot.funding?.recommendedFunding ?? "-"} CKB`,
    `- Enough for channel: ${snapshot.funding?.enoughForChannel ? "YES" : "NO"}`,
    snapshot.funding?.error ? `- Balance lookup error: ${snapshot.funding.error}` : "",
    "",
    "## Channels",
    "",
  ];

  if (snapshot.channels.length === 0) {
    lines.push("No channels found.", "");
  } else {
    for (const channel of snapshot.channels) {
      lines.push(
        `- ${channel.channelId}: ${channel.state}, ${channel.asset}, local ${channel.localBalance}, remote ${channel.remoteBalance}, peer ${channel.peerId}`,
      );
    }
    lines.push("");
  }

  lines.push("## Issues", "");
  if (readiness.issues.length === 0) {
    lines.push("No diagnostic issues detected.", "");
  } else {
    for (const issue of readiness.issues) {
      lines.push(
        `### ${issue.code}`,
        "",
        `- Severity: ${issue.severity}`,
        `- Title: ${issue.title}`,
        `- User message: ${issue.userMessage}`,
        `- Developer message: ${issue.developerMessage}`,
        `- Next action: ${issue.nextAction}`,
        "",
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

export function reportToJson(report: FlightcheckReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}
