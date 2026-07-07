import { assessReadiness } from "./readiness";
import type { FiberSnapshot, ReadinessRequest } from "./types";

export type SmokeResult = {
  ready: boolean;
  sameNetwork: boolean;
  payerReady: boolean;
  receiverReady: boolean;
  issues: string[];
};

export function smokeTest(
  payer: FiberSnapshot,
  receiver: FiberSnapshot,
  request: ReadinessRequest,
): SmokeResult {
  const payerReadiness = assessReadiness(payer, request);
  const receiverReadiness = assessReadiness(receiver, request);
  const sameNetwork =
    !!payer.node?.network &&
    !!receiver.node?.network &&
    payer.node.network === receiver.node.network;

  const issues = [
    ...payerReadiness.issues.map((issue) => `payer:${issue.code}`),
    ...receiverReadiness.issues.map((issue) => `receiver:${issue.code}`),
  ];

  if (!sameNetwork) {
    issues.push("NETWORK_MISMATCH");
  }

  return {
    ready: payerReadiness.ready && receiverReadiness.ready && sameNetwork,
    sameNetwork,
    payerReady: payerReadiness.ready,
    receiverReady: receiverReadiness.ready,
    issues,
  };
}
