# Operator Guide

## Dashboard

```powershell
cd D:\CKB\fiber-flightcheck
npm start
```

Use the scenario selector to inspect healthy and broken node/channel states.

## CLI Doctor

```powershell
npm run doctor:mock
npm run doctor -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
```

## Can-Pay JSON

```powershell
npm run can-pay:mock -- --amount 10 --asset CKB
npm run can-pay -- --rpc http://127.0.0.1:8227 --amount 10 --asset CKB
```

## Report Export

```powershell
npm run report:mock
```

Outputs:

- `flightcheck-report.json`
- `flightcheck-report.md`

## Smoke Test

```powershell
npm run smoke:mock
npm run smoke -- --payer http://127.0.0.1:8227 --receiver http://127.0.0.1:8229 --amount 1 --asset CKB
```
