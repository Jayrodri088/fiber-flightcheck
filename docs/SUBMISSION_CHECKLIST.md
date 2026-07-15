# Submission Checklist

Use this checklist for the CKBoost entry before the 15 July 2026 23:59 UTC deadline.

## Required Deliverables

- [x] Project summary: [Hackathon Submission](./HACKATHON_SUBMISSION.md)
- [x] Selected category: Node, Routing, Cross-Chain, and Diagnostics Infrastructure
- [x] Team member listed
- [x] Open-source repository: https://github.com/Jayrodri088/fiber-flightcheck
- [x] Hosted demo: http://129.151.188.227
- [x] Runnable instructions: [README](../README.md)
- [x] Technical breakdown: [Architecture](./ARCHITECTURE.md)
- [x] Infrastructure gap explained
- [x] Future roadmap
- [x] Live versus simulated functionality disclosed
- [ ] Record and upload the video demonstration
- [ ] Add the video URL to CKBoost and HACKATHON_SUBMISSION.md
- [ ] Add AI tooling receipt only if claiming the allowance
- [ ] Submit the CKBoost entry before 23:59 UTC

## Final Public Demo Check

- [ ] Landing, Console, and Runbook load without layout collisions
- [ ] /api/health returns ok: true
- [ ] Network is testnet and node is synchronized
- [ ] At least one open channel is present
- [ ] A 10 CKB readiness request succeeds
- [ ] A 0.01 CKB payment-proof dry-run succeeds
- [ ] Report and proof downloads work
- [ ] Raw FNN RPC is not publicly reachable
- [ ] Live payment execution is disabled
- [ ] GitHub main and VPS commit hashes match

## Suggested CKBoost Short Description

Fiber Flightcheck is a live payment-readiness gateway for Fiber Network. It converts node health, peers, channel lifecycle, funding, asset support, and directional liquidity into a reusable go/no-go decision with actionable diagnostics and a bounded, exportable keysend dry-run proof.

## Submission Category

Node, Routing, Cross-Chain, and Diagnostics Infrastructure
