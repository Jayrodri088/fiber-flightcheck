import type { FiberChannel } from "../lib/types";

function stateClass(state: FiberChannel["state"]) {
  return state.toLowerCase();
}

export function ChannelTable({ channels }: { channels: FiberChannel[] }) {
  if (channels.length === 0) {
    return <p className="muted">No channels in this snapshot.</p>;
  }
  return (
    <div className="channels">
      {channels.map((channel) => (
        <article key={channel.channelId} className={`channel ${stateClass(channel.state)}`}>
          <span>{channel.rawState ?? channel.state}</span>
          <strong>{channel.channelId}</strong>
          <p>
            {channel.asset} sendable {channel.localBalance} / receivable {channel.remoteBalance}
          </p>
          <small>peer {channel.peerId}</small>
          {channel.channelOutpoint ? <small>outpoint {channel.channelOutpoint}</small> : null}
          <small>
            {channel.enabled === false ? "disabled" : "enabled"} · {channel.public === false ? "private" : "public"}
          </small>
        </article>
      ))}
    </div>
  );
}
