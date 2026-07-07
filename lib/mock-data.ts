import type { FiberSnapshot } from "./types";

export type MockScenario = "healthy" | "offline" | "no-peers" | "no-channels" | "low-liquidity" | "wrong-asset";

const base = {
  node: {
    nodeId: "fnn_test_02ab...91df",
    alias: "flightcheck-demo",
    network: "testnet" as const,
    version: "fnn/0.8.x",
    synced: true,
  },
  peers: ["peer_alice", "peer_router_01"],
};

export function getMockSnapshot(scenario: MockScenario): FiberSnapshot {
  if (scenario === "offline") {
    return {
      source: "mock://offline",
      reachable: false,
      peers: [],
      channels: [],
      error: "Connection refused",
    };
  }

  if (scenario === "no-peers") {
    return {
      source: "mock://no-peers",
      reachable: true,
      node: base.node,
      peers: [],
      channels: [],
    };
  }

  if (scenario === "no-channels") {
    return {
      source: "mock://no-channels",
      reachable: true,
      node: base.node,
      peers: base.peers,
      channels: [],
    };
  }

  if (scenario === "low-liquidity") {
    return {
      source: "mock://low-liquidity",
      reachable: true,
      node: base.node,
      peers: base.peers,
      channels: [
        {
          channelId: "ch_low_001",
          peerId: "peer_router_01",
          state: "OPEN",
          asset: "CKB",
          localBalance: 2,
          remoteBalance: 120,
        },
      ],
    };
  }

  if (scenario === "wrong-asset") {
    return {
      source: "mock://wrong-asset",
      reachable: true,
      node: base.node,
      peers: base.peers,
      channels: [
        {
          channelId: "ch_usdt_001",
          peerId: "peer_router_01",
          state: "OPEN",
          asset: "USDT",
          localBalance: 500,
          remoteBalance: 300,
        },
      ],
    };
  }

  return {
    source: "mock://healthy",
    reachable: true,
    node: base.node,
    peers: base.peers,
    channels: [
      {
        channelId: "ch_ckb_001",
        peerId: "peer_router_01",
        state: "OPEN",
        asset: "CKB",
        localBalance: 80,
        remoteBalance: 45,
      },
      {
        channelId: "ch_usdt_002",
        peerId: "peer_alice",
        state: "OPEN",
        asset: "USDT",
        localBalance: 250,
        remoteBalance: 120,
      },
    ],
  };
}
