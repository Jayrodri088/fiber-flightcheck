# Hackathon Submission Draft

## Project Summary

Fiber Flightcheck is a preflight and diagnostics toolkit for Fiber Network
developers. It checks whether a node, channel setup, liquidity direction, and
asset configuration are ready for a payment before a wallet, merchant checkout,
game, L402 app, or agent workflow attempts to pay.

## Category

Primary:

- Wallet and Payment UX Infrastructure

Secondary:

- Node, Routing, Cross-Chain, and Diagnostics Infrastructure

## Infrastructure Gap

Fiber developers often fail in the gap between "node is running" and "payment
works." The failure might be RPC connectivity, missing peers, no channels,
pending channels, wrong asset, or insufficient outbound liquidity. Flightcheck
turns those failure modes into structured diagnostics and suggested fixes.

## What Works

- Mock and live Fiber RPC modes
- CLI doctor command
- JSON can-pay command
- JSON/Markdown report export
- Two-node smoke readiness check
- React dashboard
- Structured diagnostics
- Proof tests
- Production build

## What Is Mocked

The dashboard defaults to deterministic mock scenarios so it can be demoed
without a live Fiber node. Live mode is available through CLI RPC flags.

## Future Roadmap

- Real invoice lifecycle checks
- Payment attempt tracing
- Route confidence scoring
- CI integration mode
- More asset-specific liquidity analysis
- Published SDK package
