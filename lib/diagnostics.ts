import type { DiagnosticIssue, FiberSnapshot } from "./types";

const issue = (
  code: string,
  severity: DiagnosticIssue["severity"],
  title: string,
  userMessage: string,
  developerMessage: string,
  nextAction: string,
): DiagnosticIssue => ({ code, severity, title, userMessage, developerMessage, nextAction });

export function diagnose(snapshot: FiberSnapshot): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];

  if (!snapshot.reachable) {
    return [
      issue(
        "RPC_UNREACHABLE",
        "blocking",
        "Fiber RPC is unreachable",
        "The Fiber node cannot be contacted.",
        snapshot.error ?? "The HTTP JSON-RPC endpoint did not respond.",
        "Start FNN, confirm the RPC port, and retry the check.",
      ),
    ];
  }

  if (!snapshot.node) {
    issues.push(
      issue(
        "NODE_INFO_MISSING",
        "blocking",
        "Node info missing",
        "The endpoint responded but did not return usable node information.",
        "node_info returned an empty or incompatible payload.",
        "Check the RPC URL and Fiber node version.",
      ),
    );
  } else if (!snapshot.node.synced) {
    issues.push(
      issue(
        "NODE_NOT_SYNCED",
        "warning",
        "Node is not synced",
        "The node may not be ready for reliable payments yet.",
        "The snapshot reports synced=false.",
        "Wait for sync or inspect node logs.",
      ),
    );
  }

  if (snapshot.peers.length === 0) {
    issues.push(
      issue(
        "NO_PEERS",
        "blocking",
        "No connected peers",
        "Payments cannot route without peers.",
        "The node has zero known/connected peers in the snapshot.",
        "Connect to a peer or public testnet node.",
      ),
    );
  }

  if (snapshot.channels.length === 0) {
    issues.push(
      issue(
        "NO_CHANNELS",
        "blocking",
        "No channels",
        "The node has no channels available for payments.",
        "list_channels returned an empty set.",
        "Open a channel with enough outbound and inbound capacity.",
      ),
    );
  }

  const open = snapshot.channels.filter((channel) => channel.state === "OPEN");
  if (snapshot.channels.length > 0 && open.length === 0) {
    issues.push(
      issue(
        "NO_OPEN_CHANNELS",
        "blocking",
        "No open channels",
        "Channels exist but none are ready for payments.",
        `Channel states: ${snapshot.channels.map((channel) => channel.state).join(", ")}`,
        "Wait for channels to open or inspect pending/closing channels.",
      ),
    );
  }

  for (const channel of snapshot.channels) {
    if (channel.state !== "OPEN") {
      issues.push(
        issue(
          `CHANNEL_${channel.state}`,
          "warning",
          `Channel ${channel.channelId} is ${channel.state}`,
          "A channel is not ready for payment traffic.",
          `Channel ${channel.channelId} with ${channel.peerId} is ${channel.state}.`,
          "Inspect channel state and wait, close, or reopen as needed.",
        ),
      );
    }
  }

  return issues;
}
