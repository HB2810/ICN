// Simple client-side auth for the standalone CSSD app.
// Designed for the Infection Control Nurse (ICN) workflow.
import { useEffect, useState } from "react";

export type Role = "admin" | "staff" | "readonly";
export type User = { username: string; role: Role; name: string; designation: string };

const KEY = "cssd:auth";

// Production-style credentials. The ICN Officer is the primary owner of the system.
const DEFAULT_USERS: Record<string, { password: string; user: User }> = {
  icn: {
    password: "Icn@2026",
    user: {
      username: "icn",
      role: "admin",
      name: "ICN Officer",
      designation: "Infection Control Nurse",
    },
  },
  cssd: {
    password: "Cssd@2026",
    user: {
      username: "cssd",
      role: "staff",
      name: "CSSD Technician",
      designation: "CSSD Staff",
    },
  },
  auditor: {
    password: "Audit@2026",
    user: {
      username: "auditor",
      role: "readonly",
      name: "Quality Auditor",
      designation: "Read-only Auditor",
    },
  },
};

export function login(username: string, password: string): User | null {
  const u = DEFAULT_USERS[username.trim().toLowerCase()];
  if (!u || u.password !== password) return null;
  localStorage.setItem(KEY, JSON.stringify(u.user));
  window.dispatchEvent(new Event("cssd:auth"));
  return u.user;
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("cssd:auth"));
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    setUser(getUser());
    const h = () => setUser(getUser());
    window.addEventListener("cssd:auth", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("cssd:auth", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return user;
}

export function canEdit(user: User | null) {
  return !!user && user.role !== "readonly";
}
