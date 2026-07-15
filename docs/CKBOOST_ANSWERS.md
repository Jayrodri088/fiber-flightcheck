# CKBoost Submission Answers

## 1. Submission category

**Category 2: Node, Routing, Cross-Chain, and Diagnostics Infrastructure.**

Fiber Flightcheck is pre-payment diagnostics and reliability infrastructure for Fiber nodes, wallets, merchants, and application integrations. It turns live node and channel state into a clear payment-readiness decision before an application attempts a transfer.

## 2. Project overview

Fiber Flightcheck is a live payment-readiness gateway for the Fiber Network. A user supplies a payment amount and asset, and Flightcheck evaluates whether the active Fiber node can support that request now. It combines node reachability and synchronization, peer connectivity, channel lifecycle, directional liquidity, asset compatibility, and on-chain CKB funding into a go/no-go result with actionable diagnostics.

The target users are Fiber application developers, wallet and merchant teams, node operators, and CI or monitoring systems. In addition to the web console, the project exposes machine-readable output, command-line checks, downloadable reports, and a bounded live payment proof.

## 3. What problem does it solve?

A running Fiber node is not necessarily payment-ready. A payment can still fail because the RPC is unavailable, the node is not synchronized, no peer is connected, a channel is pending, the requested asset is unsupported, or liquidity exists in the wrong direction. These conditions are often discovered only after a failed payment or through several manual RPC calls.

Flightcheck moves this diagnosis before payment execution. It normalizes FNN node, peer, channel, funding, and liquidity data into one reusable readiness contract: `ready`, maximum sendable and receivable amounts, structured issue codes, and a recommended next action. This directly supports Fiber infrastructure by making payment-channel integrations easier to operate, debug, automate, and trust.

## 4. System design

The browser and CLI communicate with the Flightcheck application server; the private FNN RPC is never exposed to the browser. The server validates each request, queries the configured FNN endpoint, normalizes the responses into a `FiberSnapshot`, and runs a deterministic diagnostics and readiness engine. The same result is presented through the web console, CLI commands, JSON, Markdown, and PDF-ready reports.

For a user, the main flow is: open the console, enter an amount and asset, run Flightcheck, inspect the go/no-go decision and channel liquidity, optionally run a small payment proof, and export the evidence. For a developer or operator, the flow is: deploy Flightcheck beside FNN, configure the private RPC and proof policy through environment variables, then consume `/api/check`, the CLI, or the shared TypeScript modules from an application or CI pipeline.

The payment-proof path invokes an operator-configured `fnn-cli send_payment` keysend dry run. It is amount-capped, cooldown-protected, target-restricted, and redacted. Live payment execution remains separately locked. The Scenario Lab uses deterministic mock snapshots only to regression-test known failure modes without disrupting the live node.

## 5. Setup environment

The application uses TypeScript, React 18, Node.js, Parcel, and `tsx`. It requires Node.js 20 or newer, npm, and access to a running FNN JSON-RPC endpoint. Local setup is:

```bash
npm install
cp .env.example .env
npm run app
```

The operator configures `FIBER_RPC_URL`, the default request profile, and optional payment-proof settings in `.env`. The current live demo runs on Ubuntu with FNN, the Flightcheck Node service, systemd, and Caddy as the public reverse proxy. The demo node is connected to Fiber testnet; its FNN RPC remains bound privately on the host.

## 6. Tooling

Flightcheck calls the FNN JSON-RPC methods `node_info`, `list_peers`, and `list_channels`, then converts their responses into a stable internal model. It derives the node's CKB funding address from the funding lock script and uses the CKB testnet RPC `get_cells_capacity` method to check on-chain capacity. The payment proof is executed server-side through `fnn-cli send_payment` with keysend and dry-run controls.

The project also includes custom TypeScript diagnostics, readiness, redaction, report, and RPC modules; CLI scripts for `doctor`, `can-pay`, `report`, and smoke testing; and React components for the operational console. No private key, operator token, target peer, or private FNN URL is sent to the browser.

## 7. Current functionality

The current release provides a hosted live Fiber testnet demo and a local deployment path. It can inspect node identity, network, chain hash, version, sync status, peers, channel state, public/private channel status, channel outpoint, supported assets, sendable liquidity, receivable liquidity, and on-chain CKB funding. It evaluates an amount and asset request and returns a payment-ready decision, maximum capacities, structured blockers or warnings, and a concrete next action.

It also provides a bounded live keysend dry-run as payment-preparation evidence; Markdown, JSON, and PDF-ready report export; a channel lifecycle view; a funding-readiness panel; redacted public responses; CLI and machine-readable API access; and a Scenario Lab for deterministic failure-state demonstrations. Public RPC override and unrestricted payment execution are disabled by default.

## 8. Future functionality

Post-hackathon work would package the readiness engine as a reusable SDK, add authenticated webhooks and CI integrations, and support multi-node fleet monitoring with historical reliability and liquidity alerts. Payment diagnostics could expand to invoice validation, route confidence, fee and timeout estimates, retry analysis, and payment tracing.

The asset layer can be extended beyond CKB to UDT and stablecoin channels, including per-asset liquidity policy. A production mainnet release would add role-based access, persistent audit storage, stronger distributed rate limiting, external security review, TLS-only deployment, configurable data-retention policies, and hardware-backed or isolated signing for any explicitly enabled execution workflow.

## Payment-proof limit

The hosted demo's `0.05 CKB` payment-proof maximum is an operator safety policy configured through `PAYMENT_PROOF_MAX_CKB`; it is not a Fiber protocol limit. A tiny amount is sufficient to demonstrate that FNN can prepare a route. Keeping the public proof bounded reduces abuse and operational exposure, particularly because live execution is an adjacent but separately locked capability. The normal readiness check remains independent and can evaluate larger payment amounts.

