const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (
      typeof window !== "undefined" &&
      !path.startsWith("/login") &&
      !path.startsWith("/register")
    ) {
      window.location.assign("/login");
    }
    throw new Error("Unauthorized");
  }

  return res;
}

export async function loginUser(email: string, password: string) {
  const res = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as { token: string; user: { id: number; email: string } };
}

export async function registerUser(email: string, password: string) {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data as { token: string; user: { id: number; email: string } };
}
