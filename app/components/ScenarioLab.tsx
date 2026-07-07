import { useMemo, useState } from "react";
import { IssueList } from "../../components/IssueList";
import { MetricsGrid } from "../../components/MetricsGrid";
import { getMockSnapshot, type MockScenario } from "../../lib/mock-data";
import { buildReport } from "../../lib/readiness";

const scenarios: MockScenario[] = [
  "healthy",
  "offline",
  "no-peers",
  "no-channels",
  "low-liquidity",
  "wrong-asset",
];

export function ScenarioLab({ amount, asset }: { amount: string; asset: string }) {
  const [scenario, setScenario] = useState<MockScenario>("healthy");
  const report = useMemo(
    () => buildReport(getMockSnapshot(scenario), { amount: Number(amount), asset }),
    [scenario, amount, asset],
  );

  return (
    <details className="scenario-lab">
      <summary>
        <span>Diagnostics Scenario Lab</span>
        <small>Regression-test known failure states without touching a live node.</small>
      </summary>
      <div className="scenario-controls">
        {scenarios.map((item) => (
          <button
            className={item === scenario ? "active" : ""}
            key={item}
            onClick={() => setScenario(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="lab-result">
        <MetricsGrid report={report} />
        <IssueList issues={report.readiness.issues} />
      </div>
    </details>
  );
}
