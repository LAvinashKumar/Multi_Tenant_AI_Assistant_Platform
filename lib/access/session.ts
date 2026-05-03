/**
 * Session Access Layer
 *
 * Provides the current user session. In production this would decode a JWT
 * or read a secure session cookie. Here we use a mock session for demo purposes.
 *
 * The session is the single source of truth for who is making a request.
 */

import { cookies } from "next/headers";

export interface Session {
  userId: string;
  projectId: string;
  role: "admin" | "member";
  name: string;
}

/**
 * Mock sessions keyed by userId.
 * In production, replace with real auth (NextAuth, Clerk, etc.)
 */
const MOCK_SESSIONS: Record<string, Session> = {
  user_admin_001: {
    userId: "user_admin_001",
    projectId: process.env.MOCK_PROJECT_1_ID ?? process.env.MOCK_PROJECT_ID ?? "",
    role: "admin",
    name: "Alice Admin",
  },
  user_member_001: {
    userId: "user_member_001",
    projectId: process.env.MOCK_PROJECT_1_ID ?? process.env.MOCK_PROJECT_ID ?? "",
    role: "member",
    name: "Bob Member",
  },
  user_member_002: {
    userId: "user_member_002",
    projectId: process.env.MOCK_PROJECT_2_ID ?? "",
    role: "member",
    name: "Carol Other",
  },
};

/**
 * Reads the current session from cookie or falls back to env default.
 * Returns null if no valid session found.
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("mock_user_id");
    const userId = sessionCookie?.value ?? process.env.MOCK_USER_ID ?? "user_admin_001";
    return MOCK_SESSIONS[userId] ?? null;
  } catch {
    // During static rendering cookies() may throw — return default
    const userId = process.env.MOCK_USER_ID ?? "user_admin_001";
    return MOCK_SESSIONS[userId] ?? null;
  }
}

/**
 * Throws if no session exists (unauthenticated).
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: No valid session");
  }
  return session;
}
