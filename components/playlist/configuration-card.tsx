import type { PlaylistConfig } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

interface ConfigurationCardProps {
  configs: PlaylistConfig[];
}

export function ConfigurationCard({ configs }: ConfigurationCardProps) {
  if (!configs || configs.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle className="text-lg">TVG Configuration</CardTitle>
        </div>
        <CardDescription>Electronic Program Guide (EPG) and playlist settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {configs.map((config, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-lg">
              <h4 className="font-medium text-sm">Configuration {index + 1}</h4>
              <div className="space-y-1 text-xs">
                {config.urlTvg && (
                  <div className="flex gap-2">
                    <span className="font-medium min-w-0 flex-shrink-0">TVG URL:</span>
                    <span className="text-muted-foreground truncate" title={config.urlTvg}>
                      {config.urlTvg}
                    </span>
                  </div>
                )}
                {config.tvgShift !== undefined && (
                  <div className="flex gap-2">
                    <span className="font-medium">TVG Shift:</span>
                    <span className="text-muted-foreground">{config.tvgShift}h</span>
                  </div>
                )}
                {config.refresh && (
                  <div className="flex gap-2">
                    <span className="font-medium">Refresh:</span>
                    <span className="text-muted-foreground">{config.refresh}s</span>
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
                {config.interlace !== undefined && (
                  <div className="flex gap-2">
                    <span className="font-medium">Interlace:</span>
                    <span className="text-muted-foreground">{config.interlace}</span>
                  </div>
                )}
                {config.m3uAutoload !== undefined && (
                  <div className="flex gap-2">
                    <span className="font-medium">Auto-load:</span>
                    <span className="text-muted-foreground">{config.m3uAutoload}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
