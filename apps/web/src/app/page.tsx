"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchDashboardStats(token)
      .then(setStats)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px" }}>Dashboard</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
        <div className="card stat-card">
          <span className="stat-label">Total Comments</span>
          <span className="stat-value">{stats?.total_comments?.toLocaleString() || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Posts</span>
          <span className="stat-value">{stats?.total_posts?.toLocaleString() || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Total Uploads</span>
          <span className="stat-value">{stats?.total_uploads?.toLocaleString() || 0}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Duplicates Skipped</span>
          <span className="stat-value">{stats?.total_duplicates?.toLocaleString() || 0}</span>
        </div>
      </div>

      {stats?.latest_job && (
        <div className="card">
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Latest Upload</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Status</p>
              <span className={`badge badge-${stats.latest_job.status === "completed" ? "success" : "warning"}`}>
                {stats.latest_job.status}
              </span>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Rows Inserted</p>
              <p style={{ fontSize: "16px", fontWeight: "500" }}>{stats.latest_job.inserted_rows}</p>
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Created At</p>
              <p style={{ fontSize: "16px", fontWeight: "500" }}>
                {new Date(stats.latest_job.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}