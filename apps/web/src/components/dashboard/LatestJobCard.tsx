import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Upload } from "lucide-react";
import type { IngestionJob } from "@/types";

interface LatestJobCardProps {
  job: IngestionJob | null;
}

export function LatestJobCard({ job }: LatestJobCardProps) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Latest Upload
        </CardTitle>
        <CardDescription>Most recent data ingestion job</CardDescription>
      </CardHeader>
      <CardContent>
        {job ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                <Badge variant={job.status === "completed" ? "success" : "warning"}>
                  {job.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inserted</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {job.inserted_rows}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duplicates</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {job.duplicate_rows}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failed</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {job.failed_rows}
                </p>
              </div>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Processed at {new Date(job.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No uploads yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a CSV file to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
