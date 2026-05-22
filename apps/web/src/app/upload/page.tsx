"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchClubs, uploadFiles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload as UploadIcon, CheckCircle, XCircle } from "lucide-react";
import type { Club } from "@/types";

export default function UploadPage() {
  const { token } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [clubId, setClubId] = useState("");
  const [postType, setPostType] = useState("");
  const [caption, setCaption] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postDate, setPostDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetchClubs(token).then(setClubs).catch(() => {});
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !clubId || !postType || !postDate) {
      setMessage({ type: "error", text: "Please fill all required fields" });
      return;
    }

    if (!token) return;
    setUploading(true);
    setMessage(null);

    try {
      await uploadFiles(token, files, {
        club_id: parseInt(clubId),
        post_type: postType,
        caption,
        post_url: postUrl,
        post_date: postDate,
      });
      setMessage({ type: "success", text: "Upload successful! Data has been processed." });
      setFiles([]);
      setCaption("");
      setPostUrl("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-sm text-muted-foreground">Upload CSV files to ingest comment data</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <UploadIcon className="h-5 w-5" />
            Upload CSV
          </CardTitle>
          <CardDescription>
            Select your CSV file and fill in the post metadata
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="files">CSV Files *</Label>
              <Input
                ref={fileInputRef}
                id="files"
                type="file"
                accept=".csv,.xls,.xlsx,application/vnd.ms-excel,text/csv"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {files.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {files.length} file(s): {files.map((f) => f.name).join(", ")}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="club">Club *</Label>
                <Select id="club" value={clubId} onChange={(e) => setClubId(e.target.value)} required>
                  <option value="">Select a club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postType">Post Type *</Label>
                <Select id="postType" value={postType} onChange={(e) => setPostType(e.target.value)} required>
                  <option value="">Select type</option>
                  <option value="reel">Reel</option>
                  <option value="carousel">Carousel</option>
                  <option value="image">Image</option>
                  <option value="story">Story</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <textarea
                id="caption"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Post caption (optional)"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="postUrl">Post URL</Label>
                <Input
                  id="postUrl"
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  placeholder="https://instagram.com/p/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postDate">Post Date *</Label>
                <Input
                  id="postDate"
                  type="date"
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  required
                  className="dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {message && (
              <div className={`flex items-center gap-2 rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0" />
                )}
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Upload & Process"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
