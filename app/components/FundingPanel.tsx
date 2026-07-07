import type { FlightcheckReport } from "../../lib/types";

export function FundingPanel({ report }: { report?: FlightcheckReport }) {
  const funding = report?.snapshot.funding;

  return (
    <section className="panel funding-panel">
      <span className="label">CKB Funding</span>
      <h2>{funding?.enoughForChannel ? "Ready to open channels" : "Funding readiness"}</h2>
      {!report ? (
        <p className="muted">Run a live check to inspect the node funding address and on-chain balance.</p>
      ) : !funding ? (
        <p className="muted">This node did not expose a funding lock script in node_info.</p>
      ) : (
        <>
          <dl>
            <div>
              <dt>Funding address</dt>
              <dd>{funding.address ?? "-"}</dd>
            </div>
            <div>
              <dt>On-chain balance</dt>
              <dd>{funding.balance.toFixed(2)} CKB</dd>
            </div>
            <div>
              <dt>Minimum channel funding</dt>
              <dd>{funding.minimumChannelFunding} CKB</dd>
            </div>
            <div>
              <dt>Recommended balance</dt>
              <dd>{funding.recommendedFunding} CKB</dd>
            </div>
          </dl>
          {funding.error ? (
            <p className="funding-note warning-note">Balance lookup failed: {funding.error}</p>
          ) : (
            <p className={`funding-note ${funding.enoughForChannel ? "ready-note" : "warning-note"}`}>
              {funding.enoughForChannel
                ? "This node has enough CKB to open a standard public Fiber channel."
                : "Fund this address before opening a channel."}
            </p>
          )}
        </>
      )}
    </section>
  );
}
