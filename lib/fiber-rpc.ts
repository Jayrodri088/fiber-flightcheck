import type { FiberChannel, FiberNodeInfo, FiberSnapshot, FundingStatus } from "./types";

type JsonRpcResponse<T> = {
  result?: T;
  error?: { code: number; message: string };
};

const BECH32M_CONST = 0x2bc830a3;
const CKB = 100_000_000;
const MINIMUM_CHANNEL_FUNDING = 499;
const RECOMMENDED_CHANNEL_FUNDING = 561;
const TESTNET_CKB_RPC = "https://testnet.ckbapp.dev/";
const TESTNET_CHAIN_HASH = "0x10639e0895502b5688a6be8cf69460d76541bfa4821629d86d62ba0aae3f9606";

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

async function rpc<T>(rpcUrl: string, method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = (await response.json()) as JsonRpcResponse<T>;
  if (body.error) throw new Error(`${body.error.code}: ${body.error.message}`);
  if (body.result === undefined) throw new Error(`RPC ${method} returned no result`);
  return body.result;
}

function ckbAmount(raw: unknown): number {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return 0;
  const shannons = raw.startsWith("0x") ? Number.parseInt(raw, 16) : Number(raw);
  return Number.isFinite(shannons) ? shannons / 100_000_000 : 0;
}

function hexToBytes(hex: string): number[] {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes: number[] = [];
  for (let index = 0; index < normalized.length; index += 2) {
    bytes.push(Number.parseInt(normalized.slice(index, index + 2), 16));
  }
  return bytes;
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean) {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad && bits > 0) ret.push((acc << (toBits - bits)) & maxv);
  return ret;
}

function polymod(values: number[]) {
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let index = 0; index < 5; index += 1) {
      if ((top >> index) & 1) chk ^= generators[index];
    }
  }
  return chk;
}

function hrpExpand(hrp: string) {
  return [
    ...Array.from(hrp, (char) => char.charCodeAt(0) >> 5),
    0,
    ...Array.from(hrp, (char) => char.charCodeAt(0) & 31),
  ];
}

function bech32mEncode(hrp: string, words: number[]) {
  const values = [...hrpExpand(hrp), ...words];
  const mod = polymod([...values, 0, 0, 0, 0, 0, 0]) ^ BECH32M_CONST;
  const checksum = Array.from({ length: 6 }, (_, index) => (mod >> (5 * (5 - index))) & 31);
  return `${hrp}1${[...words, ...checksum].map((value) => CHARSET[value]).join("")}`;
}

function scriptToAddress(script: { code_hash: string; hash_type: string; args: string }, hrp: "ckt" | "ckb") {
  const hashType = script.hash_type === "type" ? 0x01 : script.hash_type === "data1" ? 0x02 : 0x00;
  const payload = [0x00, ...hexToBytes(script.code_hash), hashType, ...hexToBytes(script.args)];
  return bech32mEncode(hrp, convertBits(payload, 8, 5, true));
}

function normalizeState(raw: any): FiberChannel["state"] {
  const state = String(raw.state?.state_name ?? raw.state_name ?? raw.state ?? "").toUpperCase();
  if (state === "CHANNELREADY" || state === "OPEN") return "OPEN";
  if (state.includes("CLOS") || state.includes("SHUTDOWN")) return "CLOSING";
  if (state === "CLOSED") return "CLOSED";
  return "PENDING";
}

function normalizeNodeInfo(raw: any): FiberNodeInfo {
  const chainHash = raw.chain_hash ?? raw.chainHash;
  const network = raw.network ?? raw.chain ?? (chainHash === TESTNET_CHAIN_HASH ? "testnet" : "unknown");
  return {
    nodeId: raw.node_id ?? raw.nodeId ?? raw.pubkey ?? "unknown",
    alias: raw.alias ?? raw.node_name ?? "fiber-node",
    network,
    chainHash,
    version: raw.version,
    synced: raw.synced ?? raw.is_synced ?? true,
  };
}

async function fetchFundingStatus(
  nodeInfo: any,
  network: FiberNodeInfo["network"],
): Promise<FundingStatus | undefined> {
  const script = nodeInfo.default_funding_lock_script ?? nodeInfo.defaultFundingLockScript;
  if (!script?.code_hash || !script?.hash_type || !script?.args) return undefined;
  const isTestnet = network === "testnet";

  const status: FundingStatus = {
    address: scriptToAddress(script, isTestnet ? "ckt" : "ckb"),
    balance: 0,
    minimumChannelFunding: MINIMUM_CHANNEL_FUNDING,
    recommendedFunding: RECOMMENDED_CHANNEL_FUNDING,
    enoughForChannel: false,
    lockScript: {
      codeHash: script.code_hash,
      hashType: script.hash_type,
      args: script.args,
    },
  };

  if (!isTestnet) {
    status.error = "Funding balance lookup currently supports testnet nodes.";
    return status;
  }

  try {
    const response = await rpc<any>(TESTNET_CKB_RPC, "get_cells_capacity", [
      {
        script: {
          code_hash: script.code_hash,
          hash_type: script.hash_type,
          args: script.args,
        },
        script_type: "lock",
        script_search_mode: "exact",
      },
    ]);
    const shannons = Number.parseInt(response.capacity ?? "0x0", 16);
    status.balance = Number.isFinite(shannons) ? shannons / CKB : 0;
    status.enoughForChannel = status.balance >= status.recommendedFunding;
  } catch (error) {
    status.error = error instanceof Error ? error.message : String(error);
  }

  return status;
}

function normalizeChannel(raw: any, index: number): FiberChannel {
  const rawState = raw.state?.state_name ?? raw.state_name ?? raw.state;
  return {
    channelId: raw.channel_id ?? raw.channelId ?? `channel-${index}`,
    peerId: raw.peer_id ?? raw.peerId ?? raw.remote_peer_id ?? raw.pubkey ?? "unknown-peer",
    state: normalizeState(raw),
    asset: raw.asset ?? raw.asset_type ?? raw.udt_type_script ?? raw.funding_udt_type_script ?? "CKB",
    localBalance: ckbAmount(raw.local_balance ?? raw.localBalance ?? raw.balance_local),
    remoteBalance: ckbAmount(raw.remote_balance ?? raw.remoteBalance ?? raw.balance_remote),
    channelOutpoint: raw.channel_outpoint ?? raw.channelOutpoint,
    enabled: raw.enabled,
    public: raw.is_public ?? raw.public,
    createdAt: raw.created_at ?? raw.createdAt,
    rawState: rawState ? String(rawState) : undefined,
  };
}

export async function fetchFiberSnapshot(rpcUrl: string): Promise<FiberSnapshot> {
  try {
    const nodeInfoRaw = await rpc<any>(rpcUrl, "node_info");
    const nodeInfo = normalizeNodeInfo(nodeInfoRaw);
    const funding = await fetchFundingStatus(nodeInfoRaw, nodeInfo.network);
    const channelsRaw = await rpc<any>(rpcUrl, "list_channels", [{}]).catch(() => ({ channels: [] }));
    const peersRaw = await rpc<any>(rpcUrl, "list_peers", [{}]).catch(() => ({ peers: [] }));
    const rawChannels = Array.isArray(channelsRaw) ? channelsRaw : channelsRaw.channels ?? [];
    const rawPeers = Array.isArray(peersRaw) ? peersRaw : peersRaw.peers ?? [];
    return {
      source: rpcUrl,
      reachable: true,
      node: nodeInfo,
      peers: rawPeers.map((peer: any) => peer.pubkey ?? peer.peer_id ?? peer.peerId ?? peer.address ?? String(peer)),
      channels: rawChannels.map(normalizeChannel),
      funding,
    };
  } catch (error) {
    return {
      source: rpcUrl,
      reachable: false,
      peers: [],
      channels: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
