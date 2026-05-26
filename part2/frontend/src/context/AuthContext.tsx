import { createContext, useContext, useState, type ReactNode } from "react";

const BASE_URL = "http://localhost:5000/api";

export type UserRole = "admin" | "testuser";

export type AuthUser = {
  username: string;
  role: UserRole;
  name: string;
  phone: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string, name: string, phone: string) => Promise<string | null>;
  updateProfile: (name: string, phone: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function storeUser(u: AuthUser, token: string) {
  localStorage.setItem("taxi_user", JSON.stringify(u));
  localStorage.setItem("taxi_token", token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("taxi_user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // backfill missing fields for sessions created before profile feature
    return { name: "", phone: "", ...parsed };
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("taxi_token")
  );

  function applySession(data: { token: string; username: string; role: UserRole; name: string; phone: string }) {
    const u: AuthUser = { username: data.username, role: data.role, name: data.name, phone: data.phone };
    setUser(u);
    setToken(data.token);
    storeUser(u, data.token);
  }

  async function login(username: string, password: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Login failed";
      applySession(data);
      return null;
    } catch {
      return "Network error — is the server running?";
    }
  }

  async function register(username: string, password: string, name: string, phone: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, phone }),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Registration failed";
      applySession(data);
      return null;
    } catch {
      return "Network error — is the server running?";
    }
  }

  async function updateProfile(name: string, phone: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Update failed";
      const updated: AuthUser = { ...user!, name: data.name, phone: data.phone };
      setUser(updated);
      localStorage.setItem("taxi_user", JSON.stringify(updated));
      return null;
    } catch {
      return "Network error — is the server running?";
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("taxi_user");
    localStorage.removeItem("taxi_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
