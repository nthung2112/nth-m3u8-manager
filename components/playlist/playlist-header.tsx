"use client";

import { useRouter } from "next/navigation";
import type { M3U8Playlist } from "@/lib/types";
import { deletePlaylist } from "@/lib/storage";
import { generateM3U8Content } from "@/lib/m3u8-parser";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Trash2 } from "lucide-react";

interface PlaylistHeaderProps {
  playlist: M3U8Playlist;
}

export function PlaylistHeader({ playlist }: PlaylistHeaderProps) {
  const router = useRouter();

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    router.push("/");
  };

  const handleExportPlaylist = () => {
    const content = generateM3U8Content(playlist.channels, playlist.configs || []);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${playlist.name}.m3u8`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-foreground">{playlist.name}</h1>
        <p className="text-muted-foreground mt-1">
          {playlist.channels.length} channels • Updated {playlist.updatedAt.toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleExportPlaylist}
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePlaylist}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
