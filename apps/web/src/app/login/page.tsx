"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login(username, password);
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px", textAlign: "center" }}>
          ⚽ Football Intel
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px", textAlign: "center" }}>
          Sign in to your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Username
            </label>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>
              Password
            </label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "14px" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ justifyContent: "center", marginTop: "8px" }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}