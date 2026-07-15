# Integration Guide

Fiber Flightcheck exposes the same readiness model through TypeScript modules, HTTP, CLI, and export files.

## HTTP Readiness

    const response = await fetch("https://your-flightcheck.example/api/check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: 10, asset: "CKB" })
    });

    const report = await response.json();

    if (!report.readiness.ready) {
      console.log(report.readiness.nextAction);
    }

In a public deployment the server ignores client RPC selection and uses its private configured FNN endpoint.

## Core Module

    import { fetchFiberSnapshot } from "./lib/fiber-rpc";
    import { assessReadiness } from "./lib/readiness";

    const snapshot = await fetchFiberSnapshot("http://127.0.0.1:8227");
    const readiness = assessReadiness(snapshot, {
      amount: 10,
      asset: "CKB"
    });

    if (!readiness.ready) {
      console.log(readiness.issues);
    }

## CLI and CI

Use can-pay for machine-readable policy gates:

    npm run can-pay -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB

Use report for an audit artifact:

    npm run report -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB

Use smoke for payer and receiver preflight:

    npm run smoke -- --payer http://127.0.0.1:8227 --receiver http://127.0.0.1:8229 --amount 1 --asset CKB

## Typical Consumers

- wallet payment confirmation flows;
- merchant checkout backends;
- CI deployment gates;
- node operations dashboards;
- paywalls and metered APIs;
- games and automated agent payments.

Consumers can show the simple decision and next action to users while preserving structured issue codes and technical detail for operators.
