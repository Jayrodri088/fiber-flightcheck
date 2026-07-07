# Architecture

Fiber Flightcheck is organized as reusable infrastructure rather than a single
dashboard.

## Layers

```text
Fiber JSON-RPC or mock data
  -> FiberSnapshot
  -> diagnostics
  -> readiness assessment
  -> report export / CLI / React UI
```

## Core Modules

- `lib/fiber-rpc.ts` normalizes live Fiber JSON-RPC responses.
- `lib/mock-data.ts` provides deterministic demo scenarios.
- `lib/diagnostics.ts` converts node/channel state into structured issues.
- `lib/readiness.ts` answers whether a requested payment can be attempted.
- `lib/report.ts` exports JSON and Markdown reports.
- `lib/smoke.ts` compares payer and receiver snapshots for two-node readiness.

## Command Surface

- `doctor`: human-readable node and readiness diagnosis.
- `can-pay`: JSON readiness result for app/CI integration.
- `report`: JSON and Markdown report export.
- `smoke`: payer/receiver preflight comparison.

## UI Surface

The React app is a dashboard over the same report object used by the CLI. It is
not a separate logic path.

This keeps the product reusable: wallets, merchants, L402 apps, games, and
agent-payment flows can import the readiness logic without using the dashboard.
