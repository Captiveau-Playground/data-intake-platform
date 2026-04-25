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

export async function fetchClubs(token: string) {
  const res = await fetch(`${API_BASE}/clubs`, {
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

export async function fetchComments(token: string, postId?: number) {
  const url = postId ? `${API_BASE}/comments?post_id=${postId}` : `${API_BASE}/comments`;
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