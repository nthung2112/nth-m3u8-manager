import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <CardTitle className="mb-2">No channels found</CardTitle>
        <CardDescription>
          {hasFilters
            ? "Try adjusting your search or filter criteria"
            : "This playlist doesn't have any channels yet"}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
