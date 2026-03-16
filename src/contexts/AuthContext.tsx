import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserPlan = "enterprise" | "pro" | "starter";

export interface User {
  email: string;
  name: string;
  plan: UserPlan;
  brands: string[];
}

const MOCK_USERS: Record<string, User> = {
  "joao@gtflow.com": {
    email: "joao@gtflow.com",
    name: "João",
    plan: "enterprise",
    brands: ["GT Flow", "NovaBrand", "Stellar Co", "Zenith Labs"],
  },
  "vitor@gtflow.com": {
    email: "vitor@gtflow.com",
    name: "Vitor",
    plan: "pro",
    brands: ["Vitor Studio"],
  },
  "maria@gtflow.com": {
    email: "maria@gtflow.com",
    name: "Maria",
    plan: "starter",
    brands: [],
  },
};

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  upgradeUser: (plan: UserPlan) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    const found = MOCK_USERS[email.toLowerCase()];
    if (found) {
      setUser({ ...found });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const upgradeUser = (plan: UserPlan) => {
    if (user) {
      setUser({ ...user, plan });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, upgradeUser }}>
      {children}
    </AuthContext.Provider>
  );
};
