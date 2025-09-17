"use client";

import { createContext, useContext, ReactNode } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";

// Context type
interface AuthContextType {
  user: (Session["user"] & {
    role: "ADMIN" | "STUDENT" | "WARDEN" | "WATCHMAN" | "SUPER";
    gender: "MALE" | "FEMALE" | null;
    type: "HOSTELER" | "DAY_SCHOLAR" | null;
    department?: string | null;
  }) | null;
  loading: boolean;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Internal provider that consumes next-auth
function AuthProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const value: AuthContextType = {
    user: session?.user ?? null,
    loading: status === "loading",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Exported provider → wrap app/layout.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

// Hook for using auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
