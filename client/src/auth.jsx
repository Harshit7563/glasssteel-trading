import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "./api";

const AuthContext = createContext(null);
const TOKEN_KEY = "glassteel_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((nextUser, token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
    }
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await api.login({ email, password });
      applySession(data.user, data.token);
      return data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload) => {
      const data = await api.register(payload);
      applySession(data.user, data.token);
      return data.user;
    },
    [applySession]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isLoggedIn: !!user }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
