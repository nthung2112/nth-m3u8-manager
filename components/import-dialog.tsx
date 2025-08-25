"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Check, X } from "lucide-react";
import { parseM3U8Content } from "@/lib/m3u8-parser";
import { savePlaylist, generateId } from "@/lib/storage";
import type { ParsedM3U8, M3U8Playlist } from "@/lib/types";

interface ImportDialogProps {
  onImportComplete: () => void;
  children: React.ReactNode;
}

export function ImportDialog({ onImportComplete, children }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [playlistName, setPlaylistName] = useState("");
  const [parsedData, setParsedData] = useState<ParsedM3U8 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".m3u8") && !file.name.toLowerCase().endsWith(".m3u")) {
      setError("Please select a valid M3U8 file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const content = await file.text();
      const parsed = parseM3U8Content(content);

      if (parsed.channels.length === 0) {
        setError("No channels found in the M3U8 file");
        return;
      }

      setParsedData(parsed);
      setPlaylistName(file.name.replace(/\.(m3u8?|txt)$/i, ""));
      setStep("preview");
    } catch (err) {
      setError("Failed to parse M3U8 file. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!parsedData || !playlistName.trim()) return;

    const playlist: M3U8Playlist = {
      id: generateId(),
      name: playlistName.trim(),
      channels: parsedData.channels.map((channel) => ({
        ...channel,
        id: generateId(),
      })),
      configs: parsedData.configs,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    savePlaylist(playlist);
    onImportComplete();
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setStep("upload");
    setParsedData(null);
    setPlaylistName("");
    setError("");
  };

  const groupedChannels =
    parsedData?.channels.reduce((acc, channel) => {
      const group = channel.groupTitle || "Ungrouped";
      if (!acc[group]) acc[group] = [];
      acc[group].push(channel);
      return acc;
    }, {} as Record<string, typeof parsedData.channels>) || {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import M3U8 Playlist</DialogTitle>
          <DialogDescription>
            {step === "upload"
              ? "Upload your M3U8 file to import channels"
              : "Review and save your imported playlist"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select M3U8 File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">M3U8 files only</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".m3u8,.m3u"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                <span className="text-sm text-muted-foreground">Parsing file...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <X className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {step === "preview" && parsedData && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                id="playlist-name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
              />
            </div>

            {parsedData.configs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">TVG Configuration</h3>
                <ScrollArea className="h-24 w-full border rounded-md">
                  <div className="p-3 space-y-2">
                    {parsedData.configs.map((config, index) => (
                      <div key={index} className="text-xs space-y-1">
                        {config.urlTvg && (
                          <div className="flex gap-2">
                            <span className="font-medium">TVG URL:</span>
                            <span className="text-muted-foreground truncate">{config.urlTvg}</span>
                          </div>
                        )}
                        {config.tvgShift !== undefined && (
                          <div className="flex gap-2">
                            <span className="font-medium">TVG Shift:</span>
                            <span className="text-muted-foreground">{config.tvgShift}</span>
                          </div>
                        )}
                        {config.refresh && (
                          <div className="flex gap-2">
                            <span className="font-medium">Refresh:</span>
                            <span className="text-muted-foreground">{config.refresh}</span>
                          </div>
                        )}
                        {config.cache !== undefined && (
                          <div className="flex gap-2">
                            <span className="font-medium">Cache:</span>
                            <span className="text-muted-foreground">{config.cache}</span>
                          </div>
                        )}
                        {config.aspectRatio && (
                          <div className="flex gap-2">
                            <span className="font-medium">Aspect Ratio:</span>
                            <span className="text-muted-foreground">{config.aspectRatio}</span>
                          </div>
                        )}
                        {index < parsedData.configs.length - 1 && <hr className="my-2" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Preview</h3>
                <Badge variant="secondary">{parsedData.channels.length} channels found</Badge>
              </div>

              <ScrollArea className="h-64 w-full border rounded-md">
                <div className="p-4 space-y-4">
                  {Object.entries(groupedChannels).map(([group, channels]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {group} ({channels.length})
                      </h4>
                      <div className="space-y-1">
                        {channels.map((channel, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                          >
                            {channel.tvgLogo && (
                              <img
                                src={channel.tvgLogo || "/placeholder.svg"}
                                alt={channel.title}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{channel.title}</p>
                              {channel.tvgId && (
                                <p className="text-xs text-muted-foreground">ID: {channel.tvgId}</p>
                              )}
                            </div>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("upload")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSave}
                disabled={!playlistName.trim()}
                className="flex-1 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Save Playlist
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
