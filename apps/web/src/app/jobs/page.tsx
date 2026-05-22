"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchJobs } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { IngestionJob } from "@/types";

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "failed":
      return "destructive" as const;
    default:
      return "warning" as const;
  }
}

export default function JobsPage() {
  const { token, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchJobs(token)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ingestion Jobs</h1>
        <p className="text-sm text-muted-foreground">Track your data upload processing history</p>
      </div>

      {/* Mobile: Card view */}
      <div className="space-y-3 md:hidden">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Job #{job.id}</span>
                <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-emerald-600">{job.inserted_rows}</p>
                  <p className="text-xs text-muted-foreground">Inserted</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-600">{job.duplicate_rows}</p>
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-red-600">{job.failed_rows}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {new Date(job.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
        {jobs.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No jobs found</p>
        )}
      </div>

      {/* Desktop: Table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Total Rows</TableHead>
                <TableHead>Inserted</TableHead>
                <TableHead>Duplicates</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>{job.total_files}</TableCell>
                  <TableCell>{job.total_rows}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{job.inserted_rows}</TableCell>
                  <TableCell className="text-amber-600">{job.duplicate_rows}</TableCell>
                  <TableCell className="text-red-600">{job.failed_rows}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
