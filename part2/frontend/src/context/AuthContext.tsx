import { createContext, useContext, useState, type ReactNode } from "react";

const BASE_URL = "http://localhost:5000/api";

export type UserRole = "admin" | "testuser";

export type AuthUser = {
  username: string;
  role: UserRole;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("taxi_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("taxi_token")
  );

  async function login(username: string, password: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Login failed";

      const u: AuthUser = { username: data.username, role: data.role };
      setUser(u);
      setToken(data.token);
      localStorage.setItem("taxi_user", JSON.stringify(u));
      localStorage.setItem("taxi_token", data.token);
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
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
