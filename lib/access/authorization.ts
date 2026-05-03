/**
 * Authorization Access Layer
 *
 * Pure authorization logic — no business logic, no DB calls.
 * All permission checks live here so they can be tested in isolation.
 *
 * Rules:
 *  - Users can only access resources within their own project (tenant isolation)
 *  - Only admins can access the admin dashboard
 *  - Members can use chat features
 *  - Conversations must belong to the user's project
 */

import { Session } from "./session";

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// ─── Assertion helpers (throw on failure) ─────────────────────────────────────

/**
 * Asserts the session user belongs to the given project.
 * Throws AuthorizationError if the check fails.
 */
export function assertProjectAccess(session: Session, projectId: string): void {
  if (!canAccessProject(session, projectId)) {
    throw new AuthorizationError(
      `FORBIDDEN: User ${session.userId} does not have access to project ${projectId}`
    );
  }
}

/**
 * Asserts the session user has admin role.
 * Throws AuthorizationError if the check fails.
 */
export function assertAdminRole(session: Session): void {
  if (!isAdmin(session)) {
    throw new AuthorizationError(
      `FORBIDDEN: User ${session.userId} requires admin role`
    );
  }
}

/**
 * Asserts the conversation belongs to the user's project.
 * Throws AuthorizationError if the check fails.
 */
export function assertConversationAccess(
  session: Session,
  conversationProjectId: string
): void {
  if (!canAccessProject(session, conversationProjectId)) {
    throw new AuthorizationError(
      `FORBIDDEN: User ${session.userId} cannot access this conversation`
    );
  }
}

// ─── Boolean helpers (return true/false) ─────────────────────────────────────

/**
 * Returns true if the user can access the given project.
 */
export function canAccessProject(session: Session, projectId: string): boolean {
  return session.projectId === projectId;
}

/**
 * Returns true if the user has admin role.
 */
export function isAdmin(session: Session): boolean {
  return session.role === "admin";
}

/**
 * Returns true if the user can access the admin dashboard.
 * Must be admin AND belong to the project.
 */
export function canAccessAdminDashboard(session: Session, projectId: string): boolean {
  return isAdmin(session) && canAccessProject(session, projectId);
}

/**
 * Returns true if the conversation belongs to the user's project.
 */
export function canAccessConversation(
  session: Session,
  conversationProjectId: string
): boolean {
  return canAccessProject(session, conversationProjectId);
}
