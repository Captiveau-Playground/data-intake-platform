"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchDashboardStats } from "@/lib/api";
import { MessageSquare, FileText, Upload, Copy } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LatestJobCard } from "@/components/dashboard/LatestJobCard";
import { PlatformInfoCard } from "@/components/dashboard/PlatformInfoCard";
import type { DashboardStats } from "@/types";

export default function DashboardPage() {
  const { token, username, role, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetchDashboardStats(token)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [token]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="capitalize font-medium text-foreground">{username}</span>. Here&apos;s your platform overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Comments"
          value={stats?.total_comments ?? 0}
          description="Scraped from Instagram posts"
          icon={MessageSquare}
        />
        <StatCard
          title="Total Posts"
          value={stats?.total_posts ?? 0}
          description="Tracked Instagram posts"
          icon={FileText}
        />
        <StatCard
          title="Total Uploads"
          value={stats?.total_uploads ?? 0}
          description="Ingestion jobs processed"
          icon={Upload}
        />
        <StatCard
          title="Duplicates Skipped"
          value={stats?.total_duplicates ?? 0}
          description="Already existing comments"
          icon={Copy}
        />
      </div>

      {/* Bottom section */}
      <div className="grid gap-4 lg:grid-cols-7">
        <LatestJobCard job={stats?.latest_job ?? null} />
        <PlatformInfoCard role={role} />
      </div>
    </div>
  );
}
