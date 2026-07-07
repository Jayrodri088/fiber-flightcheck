export function UserPath() {
  return (
    <section className="user-path" aria-labelledby="use-flightcheck">
      <div>
        <span className="label">Use Flightcheck</span>
        <h2 id="use-flightcheck">From live check to your own Fiber node.</h2>
        <p>
          The public app demonstrates the readiness flow against an active testnet Fiber node.
          Operators and app teams run the same tool next to their own FNN to keep node RPC private.
        </p>
      </div>

      <div className="path-grid">
        <article>
          <span>01</span>
          <h3>Run the live check</h3>
          <p>
            Use the active node to see how Flightcheck evaluates reachability, channels, funding,
            liquidity, and payment readiness.
          </p>
          <a href="#live">Check readiness</a>
        </article>

        <article>
          <span>02</span>
          <h3>Bring your own FNN</h3>
          <p>
            Deploy or run Flightcheck in the same trusted environment as your Fiber node, then point
            `FIBER_RPC_URL` at the node's local RPC address.
          </p>
          <code>FIBER_RPC_URL=http://127.0.0.1:8227</code>
        </article>

        <article>
          <span>03</span>
          <h3>Use the decision</h3>
          <p>
            Call `/api/check`, export a report, or use the CLI before your checkout, agent, or app
            attempts a Fiber payment.
          </p>
          <code>ready: true | false</code>
        </article>
      </div>
    </section>
  );
}
