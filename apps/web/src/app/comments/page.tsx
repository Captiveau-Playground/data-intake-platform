"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchComments, fetchPosts } from "@/lib/api";

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postFilter, setPostFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([fetchComments(token), fetchPosts(token)])
      .then(([commentsData, postsData]) => {
        setComments(commentsData);
        setPosts(postsData);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredComments = comments
    .filter((c) => !postFilter || c.post_id === parseInt(postFilter))
    .filter((c) => !searchQuery || c.text?.toLowerCase().includes(searchQuery.toLowerCase()) || c.username?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Comments</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="input"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "250px" }}
          />
          <select className="input" style={{ width: "200px" }} value={postFilter} onChange={(e) => setPostFilter(e.target.value)}>
            <option value="">All Posts</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                Post #{post.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Post ID</th>
              <th>Username</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.slice(0, 100).map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.post_id}</td>
                <td>{comment.username}</td>
                <td style={{ maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {comment.text}
                </td>
                <td>{comment.comment_created_at ? new Date(comment.comment_created_at).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredComments.length === 0 && (
          <p style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>No comments found</p>
        )}
        {filteredComments.length > 100 && (
          <p style={{ textAlign: "center", padding: "16px", color: "var(--text-secondary)" }}>
            Showing first 100 of {filteredComments.length} comments
          </p>
        )}
      </div>
    </div>
  );
}