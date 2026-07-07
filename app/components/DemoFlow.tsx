import type { FlightcheckReport } from "../../lib/types";

type Step = {
  label: string;
  detail: string;
  done: boolean;
};

export function DemoFlow({ report }: { report?: FlightcheckReport }) {
  const channels = report?.snapshot.channels ?? [];
  const openChannels = channels.filter((channel) => channel.state === "OPEN");

  const steps: Step[] = [
    {
      label: "Node reachable",
      detail: report?.snapshot.reachable ? "FNN JSON-RPC responded." : "Run a live check against FNN.",
      done: Boolean(report?.snapshot.reachable),
    },
    {
      label: "Funded",
      detail: report?.snapshot.funding
        ? `${report.snapshot.funding.balance.toFixed(2)} CKB detected.`
        : "Funding address not inspected yet.",
      done: Boolean(report?.snapshot.funding?.enoughForChannel),
    },
    {
      label: "Peer connected",
      detail: `${report?.snapshot.peers.length ?? 0} peer(s) visible.`,
      done: Boolean(report && report.snapshot.peers.length > 0),
    },
    {
      label: "Channel opened",
      detail: channels.length > 0 ? `${channels.length} channel(s) found.` : "No channels found yet.",
      done: channels.length > 0,
    },
    {
      label: "Payment-ready",
      detail: report?.readiness.nextAction ?? "Run Flightcheck to evaluate payment readiness.",
      done: Boolean(report?.readiness.ready),
    },
  ];

  return (
    <section className="panel demo-flow">
      <span className="label">Demo Flow</span>
      <h2>Node reachable to payment-ready</h2>
      <div className="flow-steps">
        {steps.map((step, index) => (
          <article className={step.done ? "done" : ""} key={step.label}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <p>{step.detail}</p>
          </article>
        ))}
      </div>
      <p className="flow-summary">
        {openChannels.length > 0
          ? `Active channel liquidity: ${openChannels.reduce((total, channel) => total + channel.localBalance, 0)} CKB sendable.`
          : "Open a channel to complete the live payment path."}
      </p>
    </section>
  );
}
