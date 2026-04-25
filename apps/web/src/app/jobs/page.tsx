"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJobs } from "@/lib/api";

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchJobs(token)
      .then(setJobs)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px" }}>Ingestion Jobs</h1>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Files</th>
              <th>Total Rows</th>
              <th>Inserted</th>
              <th>Duplicates</th>
              <th>Failed</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>
                  <span className={`badge badge-${job.status === "completed" ? "success" : job.status === "failed" ? "error" : "warning"}`}>
                    {job.status}
                  </span>
                </td>
                <td>{job.total_files}</td>
                <td>{job.total_rows}</td>
                <td>{job.inserted_rows}</td>
                <td>{job.duplicate_rows}</td>
                <td>{job.failed_rows}</td>
                <td>{new Date(job.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {jobs.length === 0 && (
          <p style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>No jobs found</p>
        )}
      </div>
    </div>
  );
}