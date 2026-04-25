"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchPosts, fetchClubs } from "@/lib/api";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [clubFilter, setClubFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchPosts(token), fetchClubs(token)])
      .then(([postsData, clubsData]) => {
        setPosts(postsData);
        setClubs(clubsData);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredPosts = clubFilter ? posts.filter((p) => p.club_id === parseInt(clubFilter)) : posts;

  const getClubName = (clubId: number) => {
    const club = clubs.find((c) => c.id === clubId);
    return club?.name || clubId;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Posts</h1>
        <select className="input" style={{ width: "200px" }} value={clubFilter} onChange={(e) => setClubFilter(e.target.value)}>
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Club</th>
              <th>Type</th>
              <th>Caption</th>
              <th>Date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.map((post) => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{getClubName(post.club_id)}</td>
                <td>{post.post_type}</td>
                <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {post.caption || "-"}
                </td>
                <td>{post.post_date}</td>
                <td>{new Date(post.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <p style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>No posts found</p>
        )}
      </div>
    </div>
  );
}