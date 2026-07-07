import type { FlightcheckReport } from "../lib/types";

export function MetricsGrid({ report }: { report: FlightcheckReport }) {
  const { snapshot, readiness } = report;
  return (
    <section className="metrics">
      <div>
        <span>RPC</span>
        <strong>{snapshot.reachable ? "Online" : "Offline"}</strong>
      </div>
      <div>
        <span>Peers</span>
        <strong>{snapshot.peers.length}</strong>
      </div>
      <div>
        <span>Channels</span>
        <strong>{snapshot.channels.length}</strong>
      </div>
      <div className={readiness.ready ? "ok" : "bad"}>
        <span>Can Pay</span>
        <strong>{readiness.ready ? "YES" : "NO"}</strong>
      </div>
    </section>
  );
}
