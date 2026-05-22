"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchClubs, createClub, updateClub, deleteClub } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, X, CheckCircle } from "lucide-react";
import type { Club } from "@/types";

export default function ClubsPage() {
  const { token, role, isLoading: authLoading } = useAuth();
  const isAdmin = role === "administrator";
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [formName, setFormName] = useState("");
  const [formCountry, setFormCountry] = useState("Indonesia");
  const [formLeague, setFormLeague] = useState("Liga 1");
  const [formInstagram, setFormInstagram] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadClubs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchClubs(token, searchQuery || undefined, leagueFilter || undefined);
      setClubs(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, leagueFilter]);

  useEffect(() => {
    if (!authLoading && token) loadClubs();
  }, [authLoading, token, loadClubs]);

  const resetForm = () => {
    setFormName("");
    setFormCountry("Indonesia");
    setFormLeague("Liga 1");
    setFormInstagram("");
    setFormError("");
    setEditingClub(null);
    setShowForm(false);
  };

  const openEditForm = (club: Club) => {
    setEditingClub(club);
    setFormName(club.name);
    setFormCountry(club.country);
    setFormLeague(club.league);
    setFormInstagram(club.instagram_handle || "");
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError("");
    setSubmitting(true);

    const data = {
      name: formName,
      country: formCountry,
      league: formLeague,
      instagram_handle: formInstagram || undefined,
    };

    try {
      if (editingClub) {
        await updateClub(token, editingClub.id, data);
        showToast(`Club "${formName}" updated successfully`);
      } else {
        await createClub(token, data);
        showToast(`Club "${formName}" created successfully`);
      }
      resetForm();
      loadClubs();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (club: Club) => {
    if (!token) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus klub "${club.name}"?`)) return;
    try {
      await deleteClub(token, club.id);
      showToast(`Club "${club.name}" deleted`);
      loadClubs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const liga1Count = clubs.filter((c) => c.league === "Liga 1").length;
  const liga2Count = clubs.filter((c) => c.league === "Liga 2").length;

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm text-white shadow-lg animate-in slide-in-from-top">
          <CheckCircle className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clubs</h1>
          <p className="text-sm text-muted-foreground">
            {clubs.length} clubs — Liga 1: {liga1Count}, Liga 2: {liga2Count}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4" />
            Add Club
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          className="w-full sm:w-36"
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
        >
          <option value="">All Leagues</option>
          <option value="Liga 1">Liga 1</option>
          <option value="Liga 2">Liga 2</option>
        </Select>
      </div>

      {/* Create/Edit Form (admin only) */}
      {showForm && isAdmin && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <CardTitle>{editingClub ? "Edit Club" : "Add New Club"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {editingClub ? "Update club information" : "Add a new club to the database"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clubName">Club Name *</Label>
                  <Input
                    id="clubName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Persija Jakarta"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubLeague">League *</Label>
                  <Select
                    id="clubLeague"
                    value={formLeague}
                    onChange={(e) => setFormLeague(e.target.value)}
                  >
                    <option value="Liga 1">Liga 1</option>
                    <option value="Liga 2">Liga 2</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubCountry">Country</Label>
                  <Input
                    id="clubCountry"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="Indonesia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clubInstagram">Instagram Handle</Label>
                  <Input
                    id="clubInstagram"
                    value={formInstagram}
                    onChange={(e) => setFormInstagram(e.target.value)}
                    placeholder="@clubname"
                  />
                </div>
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editingClub ? "Update Club" : "Create Club"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mobile: Card view */}
      <div className="space-y-3 md:hidden">
        {clubs.map((club) => (
          <Card key={club.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{club.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={club.league === "Liga 1" ? "default" : "secondary"} className="text-xs">
                      {club.league}
                    </Badge>
                    {club.instagram_handle && (
                      <span className="text-xs text-muted-foreground">{club.instagram_handle}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(club.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(club)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(club)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {clubs.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No clubs found</p>
        )}
      </div>

      {/* Desktop: Table view */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>League</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Created</TableHead>
                {isAdmin && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club, idx) => (
                <TableRow key={club.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>
                    <Badge variant={club.league === "Liga 1" ? "default" : "secondary"}>
                      {club.league}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{club.instagram_handle || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(club.created_at).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(club)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(club)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {clubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center text-muted-foreground">
                    No clubs found
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
