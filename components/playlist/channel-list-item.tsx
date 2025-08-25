import type { Channel } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ChannelEditorDialog } from "@/components/channel-editor-dialog";
import { MoreVertical, Edit, Trash2, Play } from "lucide-react";

interface ChannelListItemProps {
  channel: Channel;
  onSave: (channel: Channel) => void;
  onDelete: (channelId: string) => void;
}

export function ChannelListItem({ channel, onSave, onDelete }: ChannelListItemProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {channel.tvgLogo && (
              <img
                src={channel.tvgLogo || "/placeholder.svg"}
                alt={channel.title}
                className="w-8 h-8 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-foreground truncate">{channel.title}</h4>
              <div className="flex items-center gap-4 mt-1">
                {channel.tvgId && (
                  <span className="text-xs text-muted-foreground">ID: {channel.tvgId}</span>
                )}
                <span className="text-xs text-muted-foreground truncate" title={channel.url}>
                  {channel.url}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Test Stream
              </DropdownMenuItem>
              <ChannelEditorDialog channel={channel} onSave={onSave}>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </ChannelEditorDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Channel</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{channel.title}"? This action cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(channel.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
