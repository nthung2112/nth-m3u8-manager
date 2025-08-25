import type { Channel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChannelEditorDialog } from "@/components/channel-editor-dialog";
import { Search, Plus, Filter, Grid3X3, List } from "lucide-react";

interface ChannelFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGroup: string | undefined;
  onGroupChange: (group: string | undefined) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  groups: string[];
  ungroupedCount: number;
  totalChannels: number;
  allChannels: Channel[];
  onSaveChannel: (channel: Channel) => void;
}

export function ChannelFilters({
  searchQuery,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  viewMode,
  onViewModeChange,
  groups,
  ungroupedCount,
  totalChannels,
  allChannels,
  onSaveChannel,
}: ChannelFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            {selectedGroup === "all"
              ? "All Groups"
              : selectedGroup === "ungrouped"
              ? "Ungrouped"
              : selectedGroup}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onGroupChange("all")}>
            All Groups ({totalChannels})
          </DropdownMenuItem>
          {groups.map((group) => {
            const groupCount = allChannels.filter((c) => c.groupTitle === group).length;
            return (
              <DropdownMenuItem key={group} onClick={() => onGroupChange(group)}>
                {group} ({groupCount})
              </DropdownMenuItem>
            );
          })}
          {ungroupedCount > 0 && (
            <DropdownMenuItem onClick={() => onGroupChange("ungrouped")}>
              Ungrouped ({ungroupedCount})
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex border rounded-md">
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          className="rounded-r-none"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("list")}
          className="rounded-l-none"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      <ChannelEditorDialog onSave={onSaveChannel}>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Channel
        </Button>
      </ChannelEditorDialog>
    </div>
  );
}
