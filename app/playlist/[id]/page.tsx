"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { M3U8Playlist, Channel } from "@/lib/types";
import { getPlaylists, savePlaylist } from "@/lib/storage";
import { PlaylistHeader } from "@/components/playlist/playlist-header";
import { ConfigurationCard } from "@/components/playlist/configuration-card";
import { ChannelFilters } from "@/components/playlist/channel-filters";
import { ChannelGrid } from "@/components/playlist/channel-grid";
import { ChannelList } from "@/components/playlist/channel-list";
import { EmptyState } from "@/components/playlist/empty-state";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<M3U8Playlist | null>(null);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playlists = getPlaylists();
    const found = playlists.find((p) => p.id === playlistId);

    if (!found) {
      router.push("/");
      return;
    }

    setPlaylist(found);
    setFilteredChannels(found.channels);
    setLoading(false);
  }, [playlistId, router]);

  useEffect(() => {
    if (!playlist) return;

    let filtered = playlist.channels;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (channel) =>
          channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          channel.groupTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          channel.tvgId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by group
    if (selectedGroup !== "all") {
      filtered = filtered.filter((channel) =>
        selectedGroup === "ungrouped" ? !channel.groupTitle : channel.groupTitle === selectedGroup
      );
    }

    setFilteredChannels(filtered);
  }, [playlist, searchQuery, selectedGroup]);

  const handleSaveChannel = (channel: Channel) => {
    if (!playlist) return;

    const existingIndex = playlist.channels.findIndex((c) => c.id === channel.id);
    let updatedChannels: Channel[];

    if (existingIndex >= 0) {
      // Update existing channel
      updatedChannels = [...playlist.channels];
      updatedChannels[existingIndex] = channel;
    } else {
      // Add new channel
      updatedChannels = [...playlist.channels, channel];
    }

    const updatedPlaylist = {
      ...playlist,
      channels: updatedChannels,
      updatedAt: new Date(),
    };

    savePlaylist(updatedPlaylist);
    setPlaylist(updatedPlaylist);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (!playlist) return;

    const updatedPlaylist = {
      ...playlist,
      channels: playlist.channels.filter((c) => c.id !== channelId),
      updatedAt: new Date(),
    };

    savePlaylist(updatedPlaylist);
    setPlaylist(updatedPlaylist);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  const groups = Array.from(
    new Set(
      playlist.channels.map((c) => c.groupTitle).filter((title): title is string => Boolean(title))
    )
  );
  const ungroupedCount = playlist.channels.filter((c) => !c.groupTitle).length;
  const hasFilters = searchQuery.trim() !== "" || selectedGroup !== "all";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PlaylistHeader playlist={playlist} />

        <ConfigurationCard configs={playlist.configs || []} />

        <ChannelFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          groups={groups}
          ungroupedCount={ungroupedCount}
          totalChannels={playlist.channels.length}
          allChannels={playlist.channels}
          onSaveChannel={handleSaveChannel}
        />

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredChannels.length} of {playlist.channels.length} channels
          </p>
        </div>

        {filteredChannels.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : viewMode === "grid" ? (
          <ChannelGrid
            channels={filteredChannels}
            onSave={handleSaveChannel}
            onDelete={handleDeleteChannel}
          />
        ) : (
          <ChannelList
            channels={filteredChannels}
            onSave={handleSaveChannel}
            onDelete={handleDeleteChannel}
          />
        )}
      </div>
    </div>
  );
}
