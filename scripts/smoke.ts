import { getMockSnapshot, type MockScenario } from "../lib/mock-data";
import { fetchFiberSnapshot } from "../lib/fiber-rpc";
import { smokeTest } from "../lib/smoke";
import { argValue, numberArg } from "./args";

const payerMock = argValue("payer-mock") as MockScenario | undefined;
const receiverMock = argValue("receiver-mock") as MockScenario | undefined;
const payerRpc = argValue("payer", "http://127.0.0.1:8227")!;
const receiverRpc = argValue("receiver", "http://127.0.0.1:8229")!;
const amount = numberArg("amount", 1);
const asset = argValue("asset", "CKB")!;

const payer = payerMock ? getMockSnapshot(payerMock) : await fetchFiberSnapshot(payerRpc);
const receiver = receiverMock ? getMockSnapshot(receiverMock) : await fetchFiberSnapshot(receiverRpc);
const result = smokeTest(payer, receiver, { amount, asset });

console.log(JSON.stringify(result, null, 2));
