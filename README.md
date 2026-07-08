# Fiber Flightcheck

Preflight diagnostics and payment readiness tooling for Fiber Network developers.

Fiber Flightcheck answers:

```text
Can this node/app setup make this Fiber payment right now?
If not, why not, and what should be fixed?
```

## Features

- mock and live Fiber RPC modes
- node reachability checks
- peer/channel diagnostics
- outbound and inbound liquidity summary
- asset compatibility checks
- structured failure reasons
- CLI doctor command
- `can-pay` readiness command
- React dashboard
- live Fiber node mode
- production-safe server RPC configuration
- `/api/health` deployment check
- proof script for core scenarios
- report export
- two-node smoke readiness checks
- bounded payment proof dry-run with redacted output
- operator-gated live payment execution path

## Configuration

Copy `.env.example` into your deployment environment and set the values through
your shell, process manager, or VPS service file:

```bash
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
```

`FIBER_RPC_URL` should point to the FNN JSON-RPC endpoint available to the
app server. Keep `ALLOW_CLIENT_RPC=false` for public deployments so the server
does not proxy arbitrary RPC URLs.

Set `PAYMENT_PROOF_ENABLED=true` only on a trusted operator deployment with
`FNN_CLI_PATH` and `PAYMENT_PROOF_TARGET_PUBKEY` configured. The public proof
flow runs a bounded dry-run keysend against the configured peer and redacts the
payment hash. Keep `PAYMENT_EXECUTION_ENABLED=false` for public demos unless you
are inside a short trusted judging window; live execution additionally requires
`PAYMENT_EXECUTION_TOKEN`.

## Security Posture

- FNN JSON-RPC should stay private to the app server.
- Browser users should not be able to submit arbitrary RPC URLs in public mode.
- Payment proof target peers are operator-configured, not user supplied.
- Public proof output hides the raw peer target and redacts payment hashes.
- Live payment execution is disabled by default and token-gated when enabled.
- Use tiny payment caps and cooldowns for testnet demos; review this before any
  mainnet deployment.

## Run

Live app:

```powershell
npm install
npm run app
```

Then open:

```text
http://127.0.0.1:4173
```

The app server serves the built UI and runs `/api/check` requests against the
server-configured Fiber node. The browser does not need direct access to FNN RPC.

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:4173/api/health
```

If `4173` is already in use, the app may already be running. Open the URL above,
or start a second instance on `4174`:

```powershell
npm run app:alt
```

Frontend-only development:

```powershell
npm install
npm start
```

Frontend-only mode does not provide the `/api/check` proxy, so use `npm run app`
when testing live FNN integration from the UI.

## CLI

Mock doctor:

```powershell
npm run doctor:mock
```

Mock payment readiness:

```powershell
npm run can-pay:mock -- --amount 10 --asset CKB
```

Live Fiber node:

```powershell
npm run doctor -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
npm run can-pay -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
```

Report export:

```powershell
npm run report:mock
npm run report -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
```

Generated report files are written to `reports/` by default. Passing a bare
output name, such as `--out live-flightcheck-report`, produces
`reports/live-flightcheck-report.json` and `reports/live-flightcheck-report.md`.

Two-node smoke check:

```powershell
npm run smoke:mock
npm run smoke -- --payer http://127.0.0.1:8227 --receiver http://127.0.0.1:8229 --amount 1 --asset CKB
```

## Verify

```powershell
npm run run:all
```

## Why This Exists

Fiber apps often fail in the gap between "node is running" and "payment works":
RPC may be offline, peers may be missing, channels may be pending, liquidity may
flow the wrong direction, or the requested asset may not exist in any open
channel. Flightcheck makes those failures explicit before an app or merchant
checkout attempts payment.

## Product Docs

- [Demo Runbook](./DEMO_RUNBOOK.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Integration](./docs/INTEGRATION.md)
- [Operator Guide](./docs/OPERATOR_GUIDE.md)
- [Product Brief](./docs/PRODUCT_BRIEF.md)
