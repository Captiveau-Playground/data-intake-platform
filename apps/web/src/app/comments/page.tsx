"use client";

import { useEffect, useState, useCallback } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { fetchComments, fetchPosts } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { Comment, Post } from "@/types";

const PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

export default function CommentsPage() {
  const { isAuthorized, isLoading: guardLoading } = useRoleGuard(["administrator"]);
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postFilter, setPostFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const loadComments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const postId = postFilter ? parseInt(postFilter) : undefined;
      const result = await fetchComments(token, postId, pageSize, offset);
      setComments(result.data);
      setTotal(result.total);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, postFilter]);

  useEffect(() => {
    if (!token) return;
    fetchPosts(token).then(setPosts).catch(() => {});
  }, [token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [postFilter, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  // Client-side search filter (on current page data)
  const displayedComments = searchQuery
    ? comments.filter(
        (c) =>
          c.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  if (guardLoading) {
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Comments</h1>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString()} total comments
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search on page..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-52 pl-9"
            />
          </div>
          <Select
            className="w-full sm:w-40"
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
          >
            <option value="">All Posts</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>Post #{post.id}</option>
            ))}
          </Select>
          <Select
            className="w-full sm:w-28"
            value={pageSize.toString()}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Mobile: Card view */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading...</p>
        ) : displayedComments.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No comments found</p>
        ) : (
          displayedComments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{comment.username || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">Post #{comment.post_id}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-3">{comment.text}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {comment.comment_created_at
                    ? new Date(comment.comment_created_at).toLocaleDateString()
                    : "—"}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop: Table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-20">Post</TableHead>
                <TableHead className="w-36">Username</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="w-28">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : displayedComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No comments found
                  </TableCell>
                </TableRow>
              ) : (
                displayedComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">{comment.id}</TableCell>
                    <TableCell>#{comment.post_id}</TableCell>
                    <TableCell className="font-medium">{comment.username || "—"}</TableCell>
                    <TableCell className="max-w-[400px] truncate">{comment.text}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {comment.comment_created_at
                        ? new Date(comment.comment_created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination controls */}
      {total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString()} comments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
