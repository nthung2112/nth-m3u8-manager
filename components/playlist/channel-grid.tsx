import type { Channel } from "@/lib/types";
import { ChannelCard } from "./channel-card";

interface ChannelGridProps {
  channels: Channel[];
  onSave: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
}

export function ChannelGrid({ channels, onSave, onDelete }: ChannelGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} onSave={onSave} onDelete={onDelete} />
      ))}
    </div>
  );
}
