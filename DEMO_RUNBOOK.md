# Fiber Flightcheck Demo Runbook

Hosted judging demo: http://129.151.188.227

Use this runbook when preparing the live judging demo.

## Target Setup

```text
Public browser
  -> Fiber Flightcheck app server
     -> private FNN RPC at 127.0.0.1:8227
```

Keep the FNN JSON-RPC endpoint private. Only expose the Flightcheck web app.

## Environment

```bash
export PORT=4173
export FIBER_RPC_URL=http://127.0.0.1:8227
export ALLOW_CLIENT_RPC=false
export FLIGHTCHECK_DEFAULT_AMOUNT=10
export FLIGHTCHECK_DEFAULT_ASSET=CKB
export FNN_CLI_PATH=/home/ubuntu/fiber-bin/fnn-cli
export PAYMENT_PROOF_ENABLED=true
export PAYMENT_PROOF_TARGET_PUBKEY=<trusted-peer-pubkey>
export PAYMENT_PROOF_MAX_CKB=0.05
export PAYMENT_PROOF_COOLDOWN_MS=60000
export PAYMENT_EXECUTION_ENABLED=false
```

For local developer testing only, set `ALLOW_CLIENT_RPC=true` to allow the UI to check a custom RPC URL.
Keep `PAYMENT_EXECUTION_ENABLED=false` for public access. For a short trusted
judging window, live execution may be enabled only with `PAYMENT_EXECUTION_TOKEN`
set and a tiny `PAYMENT_PROOF_MAX_CKB`.

## Start Order

1. Start FNN.
2. Confirm the FNN RPC is reachable locally.
3. Build and start Fiber Flightcheck.
4. Open the public app URL.
5. Run the live Fiber node check.

## Local Health Check

```bash
curl http://127.0.0.1:4173/api/health
```

Expected healthy signals:

- `ok: true`
- `network: testnet`
- `synced: true`
- `channels` greater than `0`
- `openChannels` greater than `0`
- `paymentReady: true`

## App Commands

```bash
npm install
npm run build
npm run serve
```

For a one-shot local run:

```bash
npm run app
```

## Demo Script

1. Open the Flightcheck URL.
2. Keep the endpoint mode on `Live node`.
3. Set amount to `10` and asset to `CKB`.
4. Click `Run Flightcheck`.
5. Show the readiness decision, funding panel, channel lifecycle, and demo flow.
6. Click `Run Payment Proof` to generate a bounded dry-run payment proof.
7. Export the live report and payment proof.

## Payment Proof Check

```bash
curl -s -X POST http://127.0.0.1:4173/api/payment-proof \
  -H 'content-type: application/json' \
  -d '{"amount":0.01,"asset":"CKB"}'
```

Expected safe public signals:

- `proofReady: true`
- `mode: dry-run`
- `target: configured Fiber peer`
- redacted `paymentHash`
- `liveExecutionEnabled: false`

## Recovery

If the app is up but readiness fails:

- Check `/api/health`.
- Confirm FNN is running.
- Confirm the configured channel is still `ChannelReady`.
- Confirm the funding address still has testnet CKB.
- Confirm `FNN_CLI_PATH` points to a working `fnn-cli`.
- Confirm `PAYMENT_PROOF_TARGET_PUBKEY` is the peer connected to the payment channel.
- Restart only the app server if the node is healthy but the UI/API is stale.
