const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function login(username: string, password: string) {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/token`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

export async function fetchClubs(token: string, search?: string, league?: string) {
  let url = `${API_BASE}/clubs`;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (league) params.append("league", league);
  if (params.toString()) url += `?${params.toString()}`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createClub(
  token: string,
  data: { name: string; country?: string; league?: string; instagram_handle?: string }
) {
  const res = await fetch(`${API_BASE}/clubs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create club");
  return res.json();
}

export async function updateClub(
  token: string,
  clubId: number,
  data: { name: string; country?: string; league?: string; instagram_handle?: string }
) {
  const res = await fetch(`${API_BASE}/clubs/${clubId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update club");
  return res.json();
}

export async function deleteClub(token: string, clubId: number) {
  const res = await fetch(`${API_BASE}/clubs/${clubId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete club");
}

export async function fetchClub(token: string, id: number) {
  const res = await fetch(`${API_BASE}/clubs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchPosts(token: string, clubId?: number) {
  const url = clubId ? `${API_BASE}/posts?club_id=${clubId}` : `${API_BASE}/posts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchComments(token: string, postId?: number, limit = 100, offset = 0) {
  let url = `${API_BASE}/comments?limit=${limit}&offset=${offset}`;
  if (postId) url += `&post_id=${postId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchJobs(token: string) {
  const res = await fetch(`${API_BASE}/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchDashboardStats(token: string) {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchCurrentUser(token: string) {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function fetchUsers(token: string) {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(
  token: string,
  data: { username: string; password: string; role: string }
) {
  const formData = new FormData();
  formData.append("username", data.username);
  formData.append("password", data.password);
  formData.append("role", data.role);

  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create user");
  }
  return res.json();
}

export async function deleteUser(token: string, userId: number) {
  const res = await fetch(`${API_BASE}/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete user");
  }
  return res.json();
}

export async function updateUserRole(token: string, userId: number, role: string) {
  const formData = new FormData();
  formData.append("role", role);

  const res = await fetch(`${API_BASE}/users/${userId}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update role");
  }
  return res.json();
}

export async function uploadFiles(
  token: string,
  files: File[],
  metadata: {
    club_id: number;
    post_type: string;
    caption?: string;
    post_url?: string;
    post_date: string;
  }
) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("metadata", JSON.stringify(metadata));

  const res = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
}