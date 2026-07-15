# Operator Guide

## Public Deployment Model

    Public browser
      -> Caddy or reverse proxy
      -> Fiber Flightcheck on localhost
      -> private FNN JSON-RPC on localhost

Only the web application should be public. Do not expose FNN JSON-RPC.

## Required Safe Defaults

    ALLOW_CLIENT_RPC=false
    PAYMENT_EXECUTION_ENABLED=false
    PAYMENT_PROOF_MAX_CKB=0.05
    PAYMENT_PROOF_COOLDOWN_MS=60000

Set PAYMENT_PROOF_TARGET_PUBKEY only through the service environment. Never render it in the browser.

## Start and Verify

    npm install
    npm run build
    npm run serve

Then verify:

    curl http://127.0.0.1:4173/api/health

Expected judging signals include ok, synced, one or more open channels, and paymentReady.

## Service Checks

    systemctl status fnn
    systemctl status fiber-flightcheck
    systemctl status caddy

Restart the app only after a successful build:

    sudo systemctl restart fiber-flightcheck

## Payment Proof

Public proof should remain dry-run only. Use a tiny request such as 0.01 CKB and confirm the response hides the raw target and full payment hash.

Live execution must only be enabled during a controlled operator window with:

- a tiny testnet amount cap;
- an unpredictable execution token;
- no token exposure in browser code or logs;
- immediate disablement after the test.

## Recovery Order

1. Check /api/health.
2. Confirm FNN is active and synchronized.
3. Confirm peers and a ChannelReady channel remain available.
4. Confirm directional send capacity covers the request.
5. Confirm FNN_CLI_PATH and proof target configuration.
6. Rebuild and restart Flightcheck only if node health is sound.
7. Keep the previous commit hash available for a fast git rollback.

## Mainnet Warning

The current hosted deployment is a testnet MVP. Mainnet requires authentication, TLS under a controlled domain, durable audit logs, distributed rate limiting, monitoring, secret management, and external security review.
