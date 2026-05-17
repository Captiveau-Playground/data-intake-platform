"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchClubs, uploadFiles } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [clubId, setClubId] = useState("");
  const [postType, setPostType] = useState("");
  const [caption, setCaption] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postDate, setPostDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchClubs(token).then(setClubs).catch(() => router.push("/login"));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !clubId || !postType || !postDate) {
      setMessage("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setUploading(true);
    setMessage("");

    try {
      await uploadFiles(token, files, {
        club_id: parseInt(clubId),
        post_type: postType,
        caption,
        post_url: postUrl,
        post_date: postDate,
      });
      setMessage("Upload successful!");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "24px" }}>Upload Data</h1>

      <div className="card" style={{ maxWidth: "600px" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>CSV Files *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xls, .xlsx, application/vnd.ms-excel, text/csv"
              multiple
              onChange={handleFileChange}
              className="input"
              style={{ padding: "8px" }}
            />
            {files.length > 0 && (
              <p style={{ fontSize: "14px", marginTop: "8px", color: "var(--text-secondary)" }}>
                {files.length} file(s) selected: {files.map((f) => f.name).join(", ")}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Club *</label>
            <select className="input" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Post Type *</label>
            <select className="input" value={postType} onChange={(e) => setPostType(e.target.value)} required>
              <option value="">Select type</option>
              <option value="reel">Reel</option>
              <option value="carousel">Carousel</option>
              <option value="image">Image</option>
              <option value="story">Story</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Caption</label>
            <textarea
              className="input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Post URL</label>
            <input
              type="url"
              className="input"
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>Post Date *</label>
            <input
              type="date"
              className="input"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              required
            />
          </div>

          {message && (
            <p style={{ color: message.includes("successful") ? "var(--success)" : "var(--danger)", fontSize: "14px" }}>
              {message}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={uploading} style={{ justifyContent: "center" }}>
            {uploading ? "Uploading..." : "Upload & Process"}
          </button>
        </form>
      </div>
    </div>
  );
}