import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "../lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const demoUser: AuthUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};
const demoSessionKey = "fitcoach.demoUser";
const demoPassword = "Admin1234!";

function getDemoUser(): AuthUser | null {
  if (!import.meta.env.DEV) return null;

  try {
    return window.localStorage.getItem(demoSessionKey) === "true"
      ? demoUser
      : null;
  } catch {
    return null;
  }
}

function setDemoUser(enabled: boolean): void {
  if (!import.meta.env.DEV) return;

  if (enabled) {
    window.localStorage.setItem(demoSessionKey, "true");
  } else {
    window.localStorage.removeItem(demoSessionKey);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — access token cookie is sent automatically
  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
        if (!cancelled) {
          setUser(data.data);
          setDemoUser(false);
        }
        return;
      } catch {
        const demo = getDemoUser();

        if (!demo) {
          if (!cancelled) setUser(null);
          return;
        }

        try {
          const { data } = await apiClient.post<{
            data: { user: AuthUser };
          }>("/auth/login", {
            email: demoUser.email,
            password: demoPassword,
          });
          if (!cancelled) {
            setUser(data.data.user);
            setDemoUser(false);
          }
        } catch {
          if (!cancelled) setUser(demo);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string): Promise<void> {
    try {
      const { data } = await apiClient.post<{
        data: { user: AuthUser };
      }>("/auth/login", { email, password });
      setUser(data.data.user);
      setDemoUser(false);
    } catch (error) {
      if (
        import.meta.env.DEV &&
        email === demoUser.email &&
        password === demoPassword
      ) {
        setUser(demoUser);
        setDemoUser(true);
        return;
      }

      throw error;
    }
  }

  async function register(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    await apiClient.post("/auth/register", { email, password, name });
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setDemoUser(false);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}
