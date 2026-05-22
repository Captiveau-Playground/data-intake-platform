/**
 * Decode role directly from JWT token payload.
 * This avoids an extra API call for UI guarding.
 */
export function getUserRole(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

/**
 * Decode username from JWT token payload.
 */
export function getUsername(): string | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired.
 */
export function isTokenExpired(): boolean {
  try {
    const token = localStorage.getItem("token");
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}
