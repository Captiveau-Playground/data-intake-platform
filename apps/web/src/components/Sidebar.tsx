"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchDashboardStats } from "@/lib/api";

export default function Sidebar() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardStats(token).then(setStats).catch(() => router.push("/login"));
  }, [router]);

  return (
    <aside className="sidebar">
      <h1 style={{ fontSize: "20px", marginBottom: "32px", fontWeight: "700" }}>
        Football Intel
      </h1>
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Link href="/" className="btn" style={{ justifyContent: "flex-start" }}>
          Dashboard
        </Link>
        <Link href="/upload" className="btn" style={{ justifyContent: "flex-start" }}>
          Upload
        </Link>
        <Link href="/posts" className="btn" style={{ justifyContent: "flex-start" }}>
          Posts
        </Link>
        <Link href="/comments" className="btn" style={{ justifyContent: "flex-start" }}>
          Comments
        </Link>
        <Link href="/jobs" className="btn" style={{ justifyContent: "flex-start" }}>
          Jobs
        </Link>
      </nav>
      {stats && (
        <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            Quick Stats
          </p>
          <p style={{ fontSize: "14px" }}>
            <strong>{stats.total_comments?.toLocaleString() || 0}</strong> comments
          </p>
          <p style={{ fontSize: "14px" }}>
            <strong>{stats.total_posts?.toLocaleString() || 0}</strong> posts
          </p>
        </div>
      )}
    </aside>
  );
}