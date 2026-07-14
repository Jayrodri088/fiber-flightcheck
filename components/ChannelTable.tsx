import type { FiberChannel } from "../lib/types";

function stateClass(state: FiberChannel["state"]) {
  return state.toLowerCase();
}

function compact(value: string, start = 10, end = 8) {
  if (value.length <= start + end + 3) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

export function ChannelTable({ channels }: { channels: FiberChannel[] }) {
  if (channels.length === 0) {
    return <p className="muted">No channels in this snapshot.</p>;
  }

  return (
    <div className="channel-list">
      {channels.map((channel) => (
        <article key={channel.channelId} className={`channel-row ${stateClass(channel.state)}`}>
          <div className="channel-primary">
            <span className="channel-state"><i aria-hidden="true" />{channel.rawState ?? channel.state}</span>
            <strong title={channel.channelId}>{compact(channel.channelId, 14, 10)}</strong>
            <p>{channel.public === false ? "Private" : "Public"} channel with {channel.asset} capacity</p>
          </div>
          <dl className="channel-capacity">
            <div>
              <dt>Sendable</dt>
              <dd>{channel.localBalance} {channel.asset}</dd>
            </div>
            <div>
              <dt>Receivable</dt>
              <dd>{channel.remoteBalance} {channel.asset}</dd>
            </div>
          </dl>
          <details className="channel-details">
            <summary>Technical details</summary>
            <dl>
              <div><dt>Peer</dt><dd>{compact(channel.peerId, 16, 12)}</dd></div>
              <div><dt>Outpoint</dt><dd>{channel.channelOutpoint ? compact(channel.channelOutpoint, 16, 12) : "-"}</dd></div>
              <div><dt>State</dt><dd>{channel.enabled === false ? "Disabled" : "Enabled"}</dd></div>
            </dl>
          </details>
        </article>
      ))}
    </div>
  );
}
