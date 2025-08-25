"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Play, AlertCircle } from "lucide-react";
import type { Channel } from "@/lib/types";
import { generateId } from "@/lib/storage";

interface ChannelEditorDialogProps {
  channel?: Channel;
  onSave: (channel: Channel) => void;
  children: React.ReactNode;
}

export function ChannelEditorDialog({ channel, onSave, children }: ChannelEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Channel>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testingStream, setTestingStream] = useState(false);
  const [streamStatus, setStreamStatus] = useState<"idle" | "success" | "error">("idle");

  const isEditing = !!channel;

  useEffect(() => {
    if (channel) {
      setFormData(channel);
    } else {
      setFormData({
        title: "",
        url: "",
        tvgId: "",
        tvgLogo: "",
        groupTitle: "",
        catchup: "",
        catchupDays: "",
        catchupSource: "",
        userAgent: "",
        referrer: "",
      });
    }
    setErrors({});
    setStreamStatus("idle");
  }, [channel, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.url?.trim()) {
      newErrors.url = "Stream URL is required";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "Please enter a valid URL";
    }

    if (formData.tvgLogo && !isValidUrl(formData.tvgLogo)) {
      newErrors.tvgLogo = "Please enter a valid logo URL";
    }

    if (formData.catchupSource && !isValidUrl(formData.catchupSource)) {
      newErrors.catchupSource = "Please enter a valid catchup source URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const channelData: Channel = {
      id: channel?.id || generateId(),
      title: formData.title!.trim(),
      url: formData.url!.trim(),
      tvgId: formData.tvgId?.trim() || undefined,
      tvgLogo: formData.tvgLogo?.trim() || undefined,
      groupTitle: formData.groupTitle?.trim() || undefined,
      catchup: formData.catchup?.trim() || undefined,
      catchupDays: formData.catchupDays?.trim() || undefined,
      catchupSource: formData.catchupSource?.trim() || undefined,
      userAgent: formData.userAgent?.trim() || undefined,
      referrer: formData.referrer?.trim() || undefined,
    };

    onSave(channelData);
    setOpen(false);
  };

  const handleTestStream = async () => {
    if (!formData.url?.trim() || !isValidUrl(formData.url)) {
      setErrors({ ...errors, url: "Please enter a valid URL first" });
      return;
    }

    setTestingStream(true);
    setStreamStatus("idle");

    try {
      // Simple HEAD request to test if the stream URL is accessible
      const response = await fetch(formData.url, { method: "HEAD", mode: "no-cors" });
      setStreamStatus("success");
    } catch (error) {
      setStreamStatus("error");
    } finally {
      setTestingStream(false);
    }
  };

  const updateFormData = (field: keyof Channel, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Channel" : "Add New Channel"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the channel information below"
              : "Enter the details for the new channel"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="catchup">Catchup</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Channel Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="e.g., CNN HD"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Stream URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={formData.url || ""}
                  onChange={(e) => updateFormData("url", e.target.value)}
                  placeholder="https://example.com/stream.m3u8"
                  className={`flex-1 ${errors.url ? "border-destructive" : ""}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestStream}
                  disabled={testingStream || !formData.url?.trim()}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {testingStream ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Test
                </Button>
              </div>
              {errors.url && <p className="text-sm text-destructive">{errors.url}</p>}
              {streamStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Stream URL is accessible
                </div>
              )}
              {streamStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Unable to access stream URL
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tvgId">TVG ID</Label>
                <Input
                  id="tvgId"
                  value={formData.tvgId || ""}
                  onChange={(e) => updateFormData("tvgId", e.target.value)}
                  placeholder="e.g., cnn-hd"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupTitle">Group</Label>
                <Input
                  id="groupTitle"
                  value={formData.groupTitle || ""}
                  onChange={(e) => updateFormData("groupTitle", e.target.value)}
                  placeholder="e.g., News"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tvgLogo">Logo URL</Label>
              <Input
                id="tvgLogo"
                value={formData.tvgLogo || ""}
                onChange={(e) => updateFormData("tvgLogo", e.target.value)}
                placeholder="https://example.com/logo.png"
                className={errors.tvgLogo ? "border-destructive" : ""}
              />
              {errors.tvgLogo && <p className="text-sm text-destructive">{errors.tvgLogo}</p>}
              {formData.tvgLogo && isValidUrl(formData.tvgLogo) && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={formData.tvgLogo || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Logo preview</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userAgent">User Agent</Label>
              <Textarea
                id="userAgent"
                value={formData.userAgent || ""}
                onChange={(e) => updateFormData("userAgent", e.target.value)}
                placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Custom user agent for stream requests</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referrer">HTTP Referrer</Label>
              <Input
                id="referrer"
                value={formData.referrer || ""}
                onChange={(e) => updateFormData("referrer", e.target.value)}
                placeholder="https://example.com/"
              />
              <p className="text-xs text-muted-foreground">
                HTTP referrer header for stream requests
              </p>
            </div>
          </TabsContent>

          <TabsContent value="catchup" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="catchup-enabled">Enable Catchup</Label>
                  <p className="text-xs text-muted-foreground">Allow viewing past content</p>
                </div>
                <Switch
                  id="catchup-enabled"
                  checked={!!formData.catchup}
                  onCheckedChange={(checked) => updateFormData("catchup", checked ? "default" : "")}
                />
              </div>

              {formData.catchup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="catchupDays">Catchup Days</Label>
                    <Input
                      id="catchupDays"
                      type="number"
                      value={formData.catchupDays || ""}
                      onChange={(e) => updateFormData("catchupDays", e.target.value)}
                      placeholder="7"
                      min="1"
                      max="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of days content is available
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catchupSource">Catchup Source URL</Label>
                    <Textarea
                      id="catchupSource"
                      value={formData.catchupSource || ""}
                      onChange={(e) => updateFormData("catchupSource", e.target.value)}
                      placeholder="http://example.com/catchup.m3u8?id=123&time=${start}&offset=${duration}"
                      rows={3}
                      className={errors.catchupSource ? "border-destructive" : ""}
                    />
                    {errors.catchupSource && (
                      <p className="text-sm text-destructive">{errors.catchupSource}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Use ${"{start}"} and ${"{duration}"} placeholders for time parameters
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {isEditing ? "Update Channel" : "Add Channel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
