import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  api,
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getAccessToken,
  formatApiError,
} from "@/lib/api";
import {
  connectSocket,
  disconnectSocket,
  onSocketEvent,
} from "@/lib/socket";
import { useRouter } from "next/router";

// ── Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  role: "owner" | "admin" | "modder" | "member";
  status: "active" | "banned";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string,
    displayName: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAdmin: boolean;
  isModder: boolean;
  isOwner: boolean;
  formatApiError: typeof formatApiError;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── Fetch current user ───────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      // Connect socket after successful auth
      connectSocket();
    } catch {
      setUser(null);
      clearTokens();
      disconnectSocket();
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Init on mount ────────────────────────────────────────────────────
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Real-time ban detection ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const unsubBan = onSocketEvent("user:banned", (data: { reason: string }) => {
      clearTokens();
      disconnectSocket();
      setUser(null);
      router.push(`/banned?reason=${encodeURIComponent(data.reason)}`);
    });

    const unsubRole = onSocketEvent("user:role-changed", () => {
      // Re-fetch user to get updated role
      refresh();
    });

    return () => {
      unsubBan();
      unsubRole();
    };
  }, [user, router, refresh]);

  // ── Login ────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<User> => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  // ── Register ─────────────────────────────────────────────────────────
  const register = async (
    username: string,
    email: string,
    password: string,
    displayName: string
  ): Promise<User> => {
    const { data } = await api.post("/auth/register", {
      username,
      email,
      password,
      displayName,
    });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUser(data.user);
    connectSocket();
    return data.user;
  };

  // ── Logout ───────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    clearTokens();
    disconnectSocket();
    setUser(null);
    router.push("/");
  };

  // ── Role helpers ─────────────────────────────────────────────────────
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin" || isOwner;
  const isModder = user?.role === "modder" || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        isAdmin,
        isModder,
        isOwner,
        formatApiError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
