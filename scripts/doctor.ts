import { getMockSnapshot, type MockScenario } from "../lib/mock-data";
import { buildReport } from "../lib/readiness";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { argValue, numberArg } from "./args";

const mock = argValue("mock") as MockScenario | undefined;
const rpc = argValue("rpc", "http://127.0.0.1:8227")!;
const amount = numberArg("amount", 10);
const asset = argValue("asset", "CKB")!;

const snapshot = mock ? getMockSnapshot(mock) : await fetchFiberSnapshot(rpc);
const report = buildReport(snapshot, { amount, asset });

console.log(`Fiber Flightcheck Doctor (${snapshot.source})`);
console.log(`Reachable: ${snapshot.reachable ? "YES" : "NO"}`);
console.log(`Peers: ${snapshot.peers.length}`);
console.log(`Channels: ${snapshot.channels.length}`);
console.log(`Ready for ${amount} ${asset}: ${report.readiness.ready ? "YES" : "NO"}`);
console.log("");

if (report.readiness.issues.length === 0) {
  console.log("PASS No diagnostic issues detected.");
} else {
  for (const issue of report.readiness.issues) {
    console.log(`${issue.severity.toUpperCase()} ${issue.code}: ${issue.title}`);
    console.log(`  ${issue.nextAction}`);
  }
}
