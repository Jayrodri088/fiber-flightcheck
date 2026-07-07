# Integration

Fiber Flightcheck's core value is reusable readiness logic.

Example:

```ts
import { fetchFiberSnapshot } from "./lib/fiber-rpc";
import { assessReadiness } from "./lib/readiness";

const snapshot = await fetchFiberSnapshot("http://127.0.0.1:8227");
const readiness = assessReadiness(snapshot, {
  amount: 10,
  asset: "CKB",
});

if (!readiness.ready) {
  console.log(readiness.nextAction);
}
```

Typical consumers:

- wallets
- merchant checkouts
- L402/paywall services
- games
- agent-payment flows
- node operators
- CI smoke tests

The output is structured so applications can decide whether to show a simple
user message or expose advanced diagnostics.
