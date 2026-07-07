# Fiber Flightcheck Demo Runbook

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
```

For local developer testing only, set `ALLOW_CLIENT_RPC=true` to allow the UI to check a custom RPC URL.

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
6. Export the live report.

## Recovery

If the app is up but readiness fails:

- Check `/api/health`.
- Confirm FNN is running.
- Confirm the configured channel is still `ChannelReady`.
- Confirm the funding address still has testnet CKB.
- Restart only the app server if the node is healthy but the UI/API is stale.
