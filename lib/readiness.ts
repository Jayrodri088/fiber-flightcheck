import { diagnose } from "./diagnostics";
import type { DiagnosticIssue, FiberSnapshot, ReadinessRequest, ReadinessResult } from "./types";

const blocking = (issues: DiagnosticIssue[]) => issues.filter((issue) => issue.severity === "blocking");

export function assessReadiness(snapshot: FiberSnapshot, request: ReadinessRequest): ReadinessResult {
  const issues = diagnose(snapshot);
  const openAssetChannels = snapshot.channels.filter(
    (channel) => channel.state === "OPEN" && channel.asset.toUpperCase() === request.asset.toUpperCase(),
  );
  const supportedAssets = [...new Set(snapshot.channels.map((channel) => channel.asset))].sort();
  const maxSendable = openAssetChannels.reduce((total, channel) => total + channel.localBalance, 0);
  const maxReceivable = openAssetChannels.reduce((total, channel) => total + channel.remoteBalance, 0);

  if (snapshot.reachable && snapshot.channels.length > 0 && openAssetChannels.length === 0) {
    issues.push({
      code: "ASSET_UNSUPPORTED",
      severity: "blocking",
      title: "Requested asset is not available",
      userMessage: `No open channel supports ${request.asset}.`,
      developerMessage: `Supported channel assets: ${supportedAssets.join(", ") || "none"}.`,
      nextAction: `Open or route through a channel that supports ${request.asset}.`,
    });
  }

  if (openAssetChannels.length > 0 && maxSendable < request.amount) {
    issues.push({
      code: "INSUFFICIENT_OUTBOUND_LIQUIDITY",
      severity: "blocking",
      title: "Insufficient outbound liquidity",
      userMessage: `This node can send ${maxSendable} ${request.asset}, but the payment needs ${request.amount}.`,
      developerMessage: "Sum of local balances across open matching channels is below requested amount.",
      nextAction: "Open, fund, or rebalance a channel with more outbound capacity.",
    });
  }

  const blockers = blocking(issues);
  return {
    ready: blockers.length === 0,
    request,
    maxSendable,
    maxReceivable,
    supportedAssets,
    issues,
    nextAction: blockers[0]?.nextAction ?? "Ready for this payment request.",
  };
}

export function buildReport(snapshot: FiberSnapshot, request: ReadinessRequest) {
  return {
    generatedAt: new Date().toISOString(),
    snapshot,
    readiness: assessReadiness(snapshot, request),
  };
}
