# Architecture

Fiber Flightcheck is reusable Fiber infrastructure with one diagnostics engine shared by the web application, CLI, API, and report exports.

## Data Flow

    Browser
      -> Flightcheck HTTP server
         -> request validation and RPC policy
         -> private FNN JSON-RPC
         -> optional operator-configured fnn-cli proof
      -> FiberSnapshot
      -> diagnostics and readiness assessment
      -> UI / JSON / Markdown / PDF / CLI

## Core Modules

- lib/fiber-rpc.ts normalizes live FNN JSON-RPC responses.
- lib/diagnostics.ts converts low-level node and channel state into structured issues.
- lib/readiness.ts evaluates amount-specific asset and directional-liquidity readiness.
- lib/report.ts generates JSON and Markdown artifacts; the UI renders a redacted PDF-ready report.
- lib/smoke.ts compares payer and receiver readiness.
- scripts/app-server.ts serves the UI and security-gated API surface.
- app contains the product UI without duplicating the diagnostic logic.

## HTTP Surface

- POST /api/check returns the normalized readiness report.
- GET /api/health returns deployment and Fiber node health.
- POST /api/payment-proof performs a bounded operator-configured keysend dry-run.
- Static routes serve the production React application.

## Trust Boundary

The browser is untrusted. In public mode it cannot choose an RPC endpoint or payment-proof target. The server owns RPC policy, proof caps, cooldowns, redaction, and the live-execution lock. FNN RPC remains private.

## Decision Model

Readiness combines:

- RPC reachability;
- synchronization and network metadata;
- connected peers;
- channel lifecycle and enabled state;
- requested asset support;
- aggregate outbound and inbound capacity;
- CKB funding state;
- amount-specific blocking issues.

The result contains a boolean decision, max sendable and receivable capacity, structured issue codes, user/developer messages, and a next action.

## Live and Deterministic Inputs

Live mode reads a real FNN node. Mock snapshots exist only for repeatable CLI and Scenario Lab regression tests. Both paths enter the same diagnostic pipeline.
