"use client";

import { useEffect, useState } from "react";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { fetchUsers, createUser, deleteUser, updateUserRole } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Trash2, Shield } from "lucide-react";

interface UserRecord {
  id: number;
  username: string;
  role: "administrator" | "datacollector";
  created_at: string;
}

export default function UsersPage() {
  const { isAuthorized, isLoading: guardLoading } = useRoleGuard(["administrator"]);
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !isAuthorized) return;
    fetchUsers(token)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, isAuthorized]);

  // Sort users: admin account always first
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === "administrator" && b.role !== "administrator") return -1;
    if (a.role !== "administrator" && b.role === "administrator") return 1;
    return a.id - b.id;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const created = await createUser(token, {
        username: newUsername,
        password: newPassword,
        role: "datacollector",
      });
      setUsers((prev) => [created, ...prev]);
      setNewUsername("");
      setNewPassword("");
      setShowForm(false);
      setFormSuccess(`User "${created.username}" created successfully`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await deleteUser(token, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!token) return;
    try {
      const updated = await updateUserRole(token, userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} users registered</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Data Collector"}
        </Button>
      </div>

      {formSuccess && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          {formSuccess}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle>Create New Data Collector</CardTitle>
            <CardDescription>Add a new data collector account. Only datacollector role can be created.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newUsername">Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. collector2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>New users will be assigned the <Badge variant="secondary" className="mx-1">Data Collector</Badge> role</span>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mobile: Card view */}
      <div className="space-y-3 md:hidden">
        {sortedUsers.map((user) => {
          const isAdmin = user.role === "administrator";
          return (
            <Card key={user.id} className={isAdmin ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isAdmin && <Shield className="h-4 w-4 text-primary" />}
                    <span className="font-medium">{user.username}</span>
                  </div>
                  {!isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => handleDeleteUser(user.id, user.username)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "🛡️ Administrator" : "📊 Data Collector"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop: Table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => {
                const isAdmin = user.role === "administrator";
                return (
                  <TableRow key={user.id} className={isAdmin ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isAdmin && <Shield className="h-4 w-4 text-primary" />}
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Badge variant="default">🛡️ Administrator</Badge>
                      ) : (
                        <Badge variant="secondary">📊 Data Collector</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
