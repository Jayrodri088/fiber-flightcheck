import { getMockSnapshot, type MockScenario } from "../lib/mock-data";
import { assessReadiness } from "../lib/readiness";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { argValue, numberArg } from "./args";

const mock = argValue("mock") as MockScenario | undefined;
const rpc = argValue("rpc", "http://127.0.0.1:8227")!;
const amount = numberArg("amount", 10);
const asset = argValue("asset", "CKB")!;

const snapshot = mock ? getMockSnapshot(mock) : await fetchFiberSnapshot(rpc);
const readiness = assessReadiness(snapshot, { amount, asset });

console.log(JSON.stringify(readiness, null, 2));
