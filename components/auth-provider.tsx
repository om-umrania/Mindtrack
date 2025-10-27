"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { User } from "@/app/lib/types";

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapClerkUserToAppUser(
  clerkUser: ReturnType<typeof useUser>["user"],
): User | null {
  if (!clerkUser) return null;
  const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress ?? "";
  const displayName =
    clerkUser.fullName || clerkUser.username || primaryEmail || clerkUser.id;

  return {
    id: clerkUser.id,
    name: displayName,
    email: primaryEmail,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();

  const value = useMemo<AuthContextType>(() => {
    const appUser = mapClerkUserToAppUser(clerkUser);

    const login = async () => {
      if (typeof window !== "undefined") {
        await openSignIn({ redirectUrl: "/dashboard" });
      }
    };

    const logout = async () => {
      await signOut();
    };

    return {
      user: appUser,
      login,
      logout,
      isLoading: !isLoaded,
    };
  }, [clerkUser, isLoaded, openSignIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
