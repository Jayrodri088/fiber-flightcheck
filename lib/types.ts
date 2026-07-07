export type Severity = "info" | "warning" | "blocking";
export type ChannelState = "OPEN" | "PENDING" | "CLOSING" | "CLOSED";

export type FiberNodeInfo = {
  nodeId: string;
  alias: string;
  network: "testnet" | "mainnet" | "devnet" | "unknown";
  chainHash?: string;
  version?: string;
  synced: boolean;
};

export type FiberChannel = {
  channelId: string;
  peerId: string;
  state: ChannelState;
  asset: string;
  localBalance: number;
  remoteBalance: number;
  channelOutpoint?: string;
  enabled?: boolean;
  public?: boolean;
  createdAt?: string;
  rawState?: string;
};

export type FiberSnapshot = {
  source: string;
  reachable: boolean;
  node?: FiberNodeInfo;
  peers: string[];
  channels: FiberChannel[];
  error?: string;
  funding?: FundingStatus;
};

export type FundingStatus = {
  address?: string;
  balance: number;
  minimumChannelFunding: number;
  recommendedFunding: number;
  enoughForChannel: boolean;
  lockScript?: {
    codeHash: string;
    hashType: string;
    args: string;
  };
  error?: string;
};

export type DiagnosticIssue = {
  code: string;
  severity: Severity;
  title: string;
  userMessage: string;
  developerMessage: string;
  nextAction: string;
};

export type ReadinessRequest = {
  amount: number;
  asset: string;
};

export type ReadinessResult = {
  ready: boolean;
  request: ReadinessRequest;
  maxSendable: number;
  maxReceivable: number;
  supportedAssets: string[];
  issues: DiagnosticIssue[];
  nextAction: string;
};

export type FlightcheckReport = {
  generatedAt: string;
  snapshot: FiberSnapshot;
  readiness: ReadinessResult;
};
