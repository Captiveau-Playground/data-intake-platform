"use client";

import { useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { fetchPosts, fetchClubs } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Post, Club } from "@/types";

export default function PostsPage() {
  const { isAuthorized, isLoading: guardLoading } = useRoleGuard(["administrator"]);
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubFilter, setClubFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchPosts(token), fetchClubs(token)])
      .then(([postsData, clubsData]) => {
        setPosts(postsData);
        setClubs(clubsData);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const filteredPosts = clubFilter
    ? posts.filter((p) => p.club_id === parseInt(clubFilter))
    : posts;

  const getClubName = (clubId: number) => {
    return clubs.find((c) => c.id === clubId)?.name || `Club #${clubId}`;
  };

  if (guardLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">{filteredPosts.length} posts found</p>
        </div>
        <Select
          className="w-full sm:w-48"
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
        >
          <option value="">All Clubs</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </Select>
      </div>

      {/* Mobile: Card view */}
      <div className="space-y-3 md:hidden">
        {filteredPosts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{getClubName(post.club_id)}</span>
                <Badge variant="secondary" className="text-xs capitalize">{post.post_type}</Badge>
              </div>
              {post.caption && (
                <p className="text-sm text-foreground line-clamp-2 mb-2">{post.caption}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{post.post_date}</span>
                <span>#{post.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No posts found</p>
        )}
      </div>

      {/* Desktop: Table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="max-w-[300px]">Caption</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.id}</TableCell>
                  <TableCell>{getClubName(post.club_id)}</TableCell>
                  <TableCell className="capitalize">{post.post_type}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {post.caption || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{post.post_date}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPosts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No posts found
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
