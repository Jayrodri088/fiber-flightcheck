import { dirname, extname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { getMockSnapshot, type MockScenario } from "../lib/mock-data";
import { buildReport } from "../lib/readiness";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { reportToJson, reportToMarkdown } from "../lib/report";
import { argValue, numberArg } from "./args";

const mock = argValue("mock") as MockScenario | undefined;
const rpc = argValue("rpc", "http://127.0.0.1:8227")!;
const amount = numberArg("amount", 10);
const asset = argValue("asset", "CKB")!;
const out = argValue("out", "flightcheck-report")!;

function reportBasePath(value: string) {
  const withoutExtension = extname(value) ? value.slice(0, -extname(value).length) : value;
  return dirname(withoutExtension) === "." ? join("reports", withoutExtension) : withoutExtension;
}

const snapshot = mock ? getMockSnapshot(mock) : await fetchFiberSnapshot(rpc);
const report = buildReport(snapshot, { amount, asset });
const basePath = reportBasePath(out);

mkdirSync(dirname(basePath), { recursive: true });
writeFileSync(`${basePath}.json`, reportToJson(report));
writeFileSync(`${basePath}.md`, reportToMarkdown(report));

console.log(`Wrote ${basePath}.json`);
console.log(`Wrote ${basePath}.md`);
