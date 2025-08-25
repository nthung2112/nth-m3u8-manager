import type { Channel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ChannelListItem } from "./channel-list-item";

interface ChannelListProps {
  channels: Channel[];
  onSave: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
}

export function ChannelList({ channels, onSave, onDelete }: ChannelListProps) {
  const groupedChannels = channels.reduce((acc, channel) => {
    const group = channel.groupTitle || "Ungrouped";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedChannels)
        .sort(([a], [b]) => {
          if (a === "Ungrouped") return 1;
          if (b === "Ungrouped") return -1;
          return a.localeCompare(b);
        })
        .map(([groupTitle, groupChannels]) => (
          <div key={groupTitle} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">{groupTitle}</h3>
              <Badge variant="outline" className="text-xs">
                {groupChannels.length} channels
              </Badge>
            </div>
            <div className="space-y-2">
              {groupChannels.map((channel) => (
                <ChannelListItem
                  key={channel.id}
                  channel={channel}
                  onSave={onSave}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
