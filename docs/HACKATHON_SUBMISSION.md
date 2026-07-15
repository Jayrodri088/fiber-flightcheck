# Fiber Flightcheck - Hackathon Submission

## Project Summary

Fiber Flightcheck is a reusable payment-readiness gateway for Fiber Network. It answers one operational question before a wallet, merchant, service, or automated workflow attempts a payment:

> Can this Fiber node satisfy this payment request now, and if not, what must be fixed?

The toolkit inspects live FNN node health, synchronization, peers, channel lifecycle, asset support, on-chain funding, and directional liquidity. It returns a clear readiness decision, structured diagnostics, exportable reports, and a bounded keysend dry-run payment proof.

## Selected Category

**Node, Routing, Cross-Chain, and Diagnostics Infrastructure**

Flightcheck fits this category as operational infrastructure for monitoring Fiber nodes, translating low-level node and channel state into actionable payment diagnostics, and testing payment readiness before execution.

## Team

- **Jayrodri088** - solo developer, product design, Fiber integration, infrastructure, testing, and deployment

## Links

- **Hosted demo:** http://129.151.188.227
- **Open-source repository:** https://github.com/Jayrodri088/fiber-flightcheck
- **Video demonstration:** Add the final uploaded video URL to the CKBoost submission form.

## The Infrastructure Gap

A running Fiber node is not the same as a payment-ready integration. An attempted payment may still fail because:

- FNN RPC is unreachable or the node is not synchronized;
- no peers are connected;
- a channel is pending, disabled, closing, or closed;
- the requested asset is absent;
- outbound liquidity is below the requested amount;
- liquidity exists in the wrong direction;
- the node is not funded sufficiently to open or maintain channels.

Developers often discover those conditions only after an attempted payment or by manually interpreting several RPC responses. Flightcheck moves that reasoning into a reusable pre-payment layer with human-readable and machine-readable output.

## Working Functionality

### Live infrastructure

- Connects server-side to a real FNN JSON-RPC endpoint.
- Reads live node, peer, channel, synchronization, network, and capacity state.
- Checks the node's testnet CKB funding balance.
- Evaluates readiness for a caller-selected amount and asset.
- Generates a bounded keysend dry-run against an operator-configured peer.
- Redacts sensitive peer and payment-hash details from public output.
- Exposes a deployment health endpoint.
- Runs as a hosted app backed by a live Fiber testnet node.

### Reusable developer surfaces

- React operator console.
- Human-readable doctor CLI.
- Machine-readable can-pay CLI.
- JSON and Markdown report export.
- Two-node smoke-readiness command.
- Deterministic failure scenarios for regression testing.
- Shared diagnostics and readiness modules across CLI, API, and UI.

## Live Demo Flow

1. Open http://129.151.188.227 and enter the Console.
2. Keep **Live node** selected.
3. Request 10 CKB.
4. Run Flightcheck.
5. Show the readiness decision, node status, directional liquidity, funding, and channel lifecycle.
6. Run Payment Proof to create a bounded keysend dry-run artifact.
7. Export the readiness report and proof.
8. Open Runbook to demonstrate deterministic failure modes and machine-readable output.

## Technical Breakdown

    Browser / CLI
        |
        v
    Flightcheck app server
        |-- request validation and RPC policy
        |-- readiness API
        |-- health endpoint
        |-- gated payment-proof endpoint
        |
        v
    Private FNN JSON-RPC + fnn-cli
        |
        v
    FiberSnapshot
        |-- node and network metadata
        |-- peers
        |-- channels and lifecycle state
        |-- directional asset capacity
        |-- CKB funding state
        |
        v
    Diagnostics + readiness engine
        |-- structured issue codes
        |-- blocking/warning severity
        |-- max sendable/receivable
        |-- next action
        |
        +--> React UI
        +--> CLI/JSON
        +--> Markdown/JSON reports
        +--> bounded payment proof

The browser never needs direct access to FNN. In the public deployment, client-supplied RPC endpoints are disabled and all live checks use the server-configured private RPC.

## Security Model

- FNN JSON-RPC remains bound to the private server path.
- Arbitrary client RPC proxying is disabled publicly.
- Payment proof targets are configured by the operator, not supplied by users.
- Public payment proof is dry-run only.
- Proof amounts are capped and requests are cooldown-limited.
- Raw peer identity and full payment hashes are hidden from public responses.
- Live execution is disabled by default and requires both an operator setting and token.
- The hosted demo uses Fiber testnet, not mainnet funds.

## What Is Simulated

The core hosted readiness flow and payment-proof dry-run are live. The Runbook's Scenario Lab uses deterministic snapshots to demonstrate failures such as unreachable RPC, missing channels, insufficient liquidity, and unsupported assets without intentionally damaging the live node.

No route scoring, cross-chain transfer, or live public payment execution is claimed in this version.

## Reusability and Integration

Wallets, merchant gateways, CI jobs, node dashboards, games, and agent-payment services can consume the structured readiness result before initiating a Fiber payment. The diagnostics engine is independent of the React interface and powers every project surface.

See [Integration](./INTEGRATION.md) and [Architecture](./ARCHITECTURE.md).

## Future Roadmap

1. Package the readiness engine as a versioned TypeScript SDK.
2. Add invoice lifecycle and payment-attempt tracing.
3. Add route confidence scoring, retry recommendations, and fee-bound checks.
4. Add authenticated webhooks and CI policy gates.
5. Expand asset-specific liquidity analysis for UDT and stable-value assets.
6. Add multi-node fleet monitoring and alerting.
7. Add production authentication, persistence, audit logs, TLS, and rate limiting.
8. Validate controlled mainnet operation after an external security review.

## Production Readiness Disclosure

This is a functional testnet infrastructure MVP and live hosted demonstration. Before production mainnet use it requires authenticated operator access, durable audit storage, stronger distributed rate limiting, TLS under a controlled domain, formal threat modeling, external security review, and operational monitoring.

## AI Tooling Disclosure

AI tooling was used as a development aide for research, implementation review, documentation, and UI iteration. The project was repeatedly tested against live Fiber infrastructure and refined through human-directed review. An AI tooling allowance claim may be submitted separately with any required proof of purchase.
