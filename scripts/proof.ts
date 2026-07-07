import assert from "node:assert/strict";
import { getMockSnapshot, type MockScenario } from "../lib/mock-data";
import { assessReadiness } from "../lib/readiness";
import { reportToMarkdown } from "../lib/report";
import { buildReport } from "../lib/readiness";
import { smokeTest } from "../lib/smoke";

function check(scenario: MockScenario, amount: number, asset: string, expected: boolean, code?: string) {
  const result = assessReadiness(getMockSnapshot(scenario), { amount, asset });
  assert.equal(result.ready, expected, `${scenario} readiness mismatch`);
  if (code) {
    assert(result.issues.some((issue) => issue.code === code), `${scenario} missing ${code}`);
  }
}

check("healthy", 10, "CKB", true);
check("offline", 10, "CKB", false, "RPC_UNREACHABLE");
check("no-peers", 10, "CKB", false, "NO_PEERS");
check("no-channels", 10, "CKB", false, "NO_CHANNELS");
check("low-liquidity", 10, "CKB", false, "INSUFFICIENT_OUTBOUND_LIQUIDITY");
check("wrong-asset", 10, "CKB", false, "ASSET_UNSUPPORTED");

const report = buildReport(getMockSnapshot("healthy"), { amount: 10, asset: "CKB" });
assert(reportToMarkdown(report).includes("Fiber Flightcheck Report"));

const smoke = smokeTest(getMockSnapshot("healthy"), getMockSnapshot("healthy"), { amount: 1, asset: "CKB" });
assert.equal(smoke.ready, true);

const brokenSmoke = smokeTest(getMockSnapshot("low-liquidity"), getMockSnapshot("healthy"), {
  amount: 10,
  asset: "CKB",
});
assert.equal(brokenSmoke.ready, false);
assert(brokenSmoke.issues.includes("payer:INSUFFICIENT_OUTBOUND_LIQUIDITY"));

console.log("Fiber Flightcheck proof passed.");
