"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { M3U8Playlist } from "@/lib/types";
import { getPlaylists } from "@/lib/storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImportDialog } from "@/components/import-dialog";
import { Plus, Upload, List } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<M3U8Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlaylists = () => {
    const stored = getPlaylists();
    setPlaylists(stored);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">M3U8 Manager</h1>
            <p className="text-muted-foreground mt-2">
              Import, manage, and edit your IPTV playlists
            </p>
          </div>
          <ImportDialog onImportComplete={loadPlaylists}>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import M3U8
            </Button>
          </ImportDialog>
        </div>

        {playlists.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No playlists found</CardTitle>
              <CardDescription className="mb-6">
                Get started by importing your first M3U8 playlist file
              </CardDescription>
              <ImportDialog onImportComplete={loadPlaylists}>
                <Button className="flex items-center gap-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  Import Your First Playlist
                </Button>
              </ImportDialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <Card key={playlist.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {playlist.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {playlist.channels.length} channels
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Updated {playlist.updatedAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => router.push(`/playlist/${playlist.id}`)}
                    >
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
