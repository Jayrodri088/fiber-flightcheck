# Demo Script

## 1. Show the Dashboard

```powershell
cd D:\CKB\fiber-flightcheck
npm start
```

Open the local Parcel URL.

Demo flow:

1. Start with `healthy`.
2. Show Ready status.
3. Switch to `low-liquidity`.
4. Show `INSUFFICIENT_OUTBOUND_LIQUIDITY`.
5. Switch to `wrong-asset`.
6. Show `ASSET_UNSUPPORTED`.
7. Point to raw JSON report for app integration.

## 2. CLI Doctor

```powershell
npm run doctor:mock
```

Explain that this is the same diagnostic engine as the UI.

## 3. Can-Pay JSON

```powershell
npm run can-pay:mock -- --amount 10 --asset CKB
```

Explain how a wallet or merchant checkout can use the JSON response.

## 4. Report Export

```powershell
npm run report:mock
```

Show:

- `flightcheck-report.json`
- `flightcheck-report.md`

## 5. Smoke Test

```powershell
npm run smoke:mock
```

Explain that live mode accepts payer and receiver RPC URLs.
