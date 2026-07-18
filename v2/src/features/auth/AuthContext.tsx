"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { Role } from "@/lib/rbac";

export interface CurrentUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  organization: string | null;
  profilePicture: string | null;
  isEmailVerified: boolean;
}

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const res = await apiFetch<{ user: CurrentUser }>("/api/auth/me");
        return res.data.user;
      } catch {
        return null; // unauthenticated
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const user = data ?? null;
  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string; rememberMe?: boolean }) =>
      apiFetch<{ user: CurrentUser; emailVerificationRequired?: boolean }>(
        "/api/auth/login",
        { method: "POST", body },
      ),
    onSuccess: (res) => qc.setQueryData(["auth", "me"], res.data.user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username?: string;
      organization?: string;
    }) => apiFetch<{ user: CurrentUser }>("/api/auth/register", { method: "POST", body }),
    onSuccess: (res) => qc.setQueryData(["auth", "me"], res.data.user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      qc.setQueryData(["auth", "me"], null);
      qc.clear();
    },
  });
}
