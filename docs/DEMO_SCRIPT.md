# Fiber Flightcheck - 3 Minute Demo Script

## Before Recording or Judging

1. Confirm http://129.151.188.227/api/health returns ok, synced, one or more open channels, and paymentReady.
2. Open http://129.151.188.227 in a private browser window.
3. Keep the VPS FNN, Fiber Flightcheck, and Caddy services running.
4. Use 10 CKB for readiness and 0.01 CKB for the bounded payment proof.
5. Keep public live execution disabled.

## 0:00-0:25 - Problem

"Fiber Flightcheck is a payment-readiness gateway for Fiber Network. A node can be online while a payment still fails because of synchronization, peers, channel state, asset mismatch, funding, or liquidity direction. Flightcheck checks those conditions before an application attempts payment."

Show the landing page and open Console.

## 0:25-1:10 - Live Readiness

Keep **Live node** selected, set the request to **10 CKB**, and click **Run Flightcheck**.

Show:

- the ready or blocked decision;
- live network and synchronization status;
- peers and open channels;
- send and receive capacity;
- the actionable next step.

Say: "This data comes from the server's private live FNN RPC. The public browser cannot choose or access that RPC."

## 1:10-1:40 - Channel and Funding Diagnostics

Scroll to Funding and Lifecycle and Liquidity.

Say: "Flightcheck distinguishes on-chain channel funding from directional off-chain capacity. Long channel, peer, and outpoint identifiers are collapsed behind technical details so operators get the signal first."

## 1:40-2:10 - Payment Proof

Use **0.01 CKB** if the current proof cap requires it, then click **Run Payment Proof**.

Show the proof status and export control.

Say: "This is a real bounded keysend dry-run against an operator-configured Fiber peer. The target and payment hash are redacted, requests are capped and cooldown-limited, and public live execution remains locked."

## 2:10-2:35 - Reusable Infrastructure

Export the JSON or Markdown readiness report, then briefly show the repository CLI commands.

Say: "The React console, doctor CLI, can-pay JSON command, reports, and smoke checks all use the same diagnostics and readiness engine. Wallets, merchants, CI systems, and node operators can integrate the structured result without adopting this UI."

## 2:35-2:55 - Failure Coverage

Open Runbook and expand Scenario Lab.

Show one blocking case such as insufficient outbound liquidity or unsupported asset.

Say: "Deterministic scenarios regression-test failure handling without breaking the live node. They are clearly separated from the live demo path."

## 2:55-3:00 - Close

"Fiber Flightcheck turns fragmented Fiber state into one pre-payment decision, one next action, and one auditable proof."

## Recording Checklist

- Record at 1080p or higher.
- Keep browser zoom at 100%.
- Hide bookmarks, notifications, keys, terminal history, and unrelated tabs.
- Do not show the VPS SSH key, service environment, raw peer target, or execution token.
- Upload the video and place its URL in the CKBoost submission form and Hackathon Submission document.
