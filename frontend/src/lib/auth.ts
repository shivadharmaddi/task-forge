"use client";

const AUTH_KEY = "taskforge_auth";

export interface AuthUser {
  email: string;
  name: string;
}

const DEMO_USER: AuthUser = {
  email: "demo@taskforge.dev",
  name: "Shivadhar",
};

export function login(email: string, password: string): boolean {
  if (email === "demo@taskforge.dev" && password === "demo123") {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(DEMO_USER));
    }
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
