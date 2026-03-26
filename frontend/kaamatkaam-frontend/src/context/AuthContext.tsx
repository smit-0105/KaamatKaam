import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "../api/authApi";

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profilePhoto: string;
  avgRating?: number;
  totalReviews?: number;
  token: string;
  vehicle?: { make?: string; model?: string; color?: string; plateNumber?: string };
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phoneNumber: string; gender?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("kaamatkaam_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("kaamatkaam_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const userData = res.data.data;
    setUser(userData);
    localStorage.setItem("kaamatkaam_user", JSON.stringify(userData));
  };

  const register = async (data: { name: string; email: string; password: string; phoneNumber: string; gender?: string }) => {
    const res = await authApi.register(data);
    const userData = res.data.data;
    setUser(userData);
    localStorage.setItem("kaamatkaam_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("kaamatkaam_user");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem("kaamatkaam_user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
