# Fiber Flightcheck

**A live payment-readiness gateway for Fiber Network.**

Fiber Flightcheck answers a practical question before a wallet, merchant, service, or automated workflow attempts payment:

> Can this Fiber node satisfy this payment request now, and if not, what must be fixed?

[Open the hosted demo](http://129.151.188.227) · [Read the hackathon submission](./docs/HACKATHON_SUBMISSION.md) · [Follow the demo script](./docs/DEMO_SCRIPT.md)

## Why It Matters

A running FNN node can still be unable to pay. The node may be unsynchronized, disconnected from peers, missing an open channel, funded with the wrong asset, or short of outbound liquidity. Fiber Flightcheck evaluates those conditions before execution and returns one readiness decision, structured issues, and an actionable next step.

## What Works

- Live server-side FNN JSON-RPC inspection
- Node, network, synchronization, and peer health
- Channel lifecycle and directional liquidity analysis
- Asset compatibility and CKB funding checks
- Amount-specific ready or blocked decision
- Bounded keysend dry-run payment proof
- Redacted public proof output and operator-gated execution
- React operator console
- Human-readable doctor CLI
- Machine-readable can-pay CLI
- JSON and Markdown report export
- Two-node smoke checks
- Deterministic regression scenarios

## Quick Judge Flow

1. Open http://129.151.188.227 and select **Console**.
2. Keep **Live node** selected and request **10 CKB**.
3. Run Flightcheck and inspect the readiness decision.
4. Review node state, capacity, funding, and channel lifecycle.
5. Run a **0.01 CKB** Payment Proof dry-run.
6. Export the readiness report or payment proof.
7. Open **Runbook** to inspect safeguards and deterministic failure scenarios.

## Architecture

    Browser / CLI
        |
        v
    Flightcheck app server
        |
        +--> private FNN JSON-RPC
        +--> operator-configured fnn-cli
        |
        v
    normalized FiberSnapshot
        |
        v
    diagnostics + readiness engine
        |
        +--> UI decision
        +--> CLI / JSON
        +--> Markdown / JSON reports
        +--> bounded payment proof

The UI, CLI, API, and report exports use the same diagnostic engine.

## Security Posture

- The public browser does not receive the FNN RPC address.
- Client-selected RPC endpoints are disabled in the hosted deployment.
- Payment proof targets are operator-configured.
- Public proof requests are capped and cooldown-limited.
- Peer identity and full payment hashes are hidden publicly.
- Live payment execution is disabled by default and token-gated.
- The hosted demonstration uses Fiber testnet.

See [Operator Guide](./docs/OPERATOR_GUIDE.md) for deployment controls.

## Run Locally

Requirements:

- Node.js 20 or newer
- npm
- An FNN node for live checks, or the included mock scenarios

Install and start the full app:

    npm install
    npm run app

Open http://127.0.0.1:4173.

The app server serves the production UI and proxies checks only to the configured FNN endpoint.

## Configuration

Configure through the shell, process manager, or VPS service:

    PORT=4173
    FIBER_RPC_URL=http://127.0.0.1:8227
    ALLOW_CLIENT_RPC=false
    FLIGHTCHECK_DEFAULT_AMOUNT=10
    FLIGHTCHECK_DEFAULT_ASSET=CKB
    FNN_CLI_PATH=fnn-cli
    PAYMENT_PROOF_ENABLED=false
    PAYMENT_PROOF_TARGET_PUBKEY=
    PAYMENT_PROOF_MAX_CKB=1
    PAYMENT_PROOF_COOLDOWN_MS=60000
    PAYMENT_EXECUTION_ENABLED=false
    PAYMENT_EXECUTION_TOKEN=

Never commit real execution tokens or private keys.

## CLI

    npm run doctor:mock
    npm run can-pay:mock -- --amount 10 --asset CKB
    npm run report:mock
    npm run smoke:mock

Live FNN:

    npm run doctor -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
    npm run can-pay -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB

Generated reports are written to reports by default.

## Verification

Run the complete local verification suite:

    npm run run:all

Deployment health:

    curl http://127.0.0.1:4173/api/health

## Live Versus Simulated

The hosted node inspection, readiness decision, funding check, channel data, and payment-proof dry-run are live against Fiber testnet. Runbook failure scenarios are deterministic simulations used to regression-test failures without damaging the live node.

This is a functional testnet infrastructure MVP. Mainnet production use still requires authentication, durable audit storage, distributed rate limiting, TLS under a controlled domain, monitoring, and external security review.

## Documentation

- [Hackathon Submission](./docs/HACKATHON_SUBMISSION.md)
- [Submission Checklist](./docs/SUBMISSION_CHECKLIST.md)
- [Demo Runbook](./DEMO_RUNBOOK.md)
- [Three-Minute Demo Script](./docs/DEMO_SCRIPT.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Integration Guide](./docs/INTEGRATION.md)
- [Operator Guide](./docs/OPERATOR_GUIDE.md)
- [Product Brief](./docs/PRODUCT_BRIEF.md)

## License

MIT
