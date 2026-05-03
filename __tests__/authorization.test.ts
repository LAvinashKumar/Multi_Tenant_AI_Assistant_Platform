/**
 * Unit tests for the Access Layer (authorization rules).
 * These tests run without any DB or network — pure logic only.
 */

import {
  assertProjectAccess,
  assertAdminRole,
  assertConversationAccess,
  canAccessProject,
  canAccessConversation,
  isAdmin,
  canAccessAdminDashboard,
  AuthorizationError,
} from "../lib/access/authorization";
import { Session } from "../lib/access/session";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const adminSession: Session = {
  userId: "user_admin_001",
  projectId: "project_001",
  role: "admin",
  name: "Alice Admin",
};

const memberSession: Session = {
  userId: "user_member_001",
  projectId: "project_001",
  role: "member",
  name: "Bob Member",
};

const otherProjectSession: Session = {
  userId: "user_member_002",
  projectId: "project_002",
  role: "member",
  name: "Carol Other",
};

// ─── assertProjectAccess ──────────────────────────────────────────────────────

describe("assertProjectAccess", () => {
  it("passes when admin belongs to the project", () => {
    expect(() => assertProjectAccess(adminSession, "project_001")).not.toThrow();
  });

  it("passes when member belongs to the project", () => {
    expect(() => assertProjectAccess(memberSession, "project_001")).not.toThrow();
  });

  it("throws AuthorizationError when user belongs to a different project", () => {
    expect(() => assertProjectAccess(otherProjectSession, "project_001")).toThrow(
      AuthorizationError
    );
  });

  it("throws with FORBIDDEN in the message", () => {
    expect(() => assertProjectAccess(otherProjectSession, "project_001")).toThrow(/FORBIDDEN/);
  });

  it("throws when admin tries to access a different project", () => {
    expect(() => assertProjectAccess(adminSession, "project_002")).toThrow(AuthorizationError);
  });
});

// ─── assertAdminRole ──────────────────────────────────────────────────────────

describe("assertAdminRole", () => {
  it("passes for admin users", () => {
    expect(() => assertAdminRole(adminSession)).not.toThrow();
  });

  it("throws AuthorizationError for member users", () => {
    expect(() => assertAdminRole(memberSession)).toThrow(AuthorizationError);
  });

  it("throws with FORBIDDEN in the message", () => {
    expect(() => assertAdminRole(memberSession)).toThrow(/FORBIDDEN/);
  });

  it("throws for member in other project", () => {
    expect(() => assertAdminRole(otherProjectSession)).toThrow(AuthorizationError);
  });
});

// ─── assertConversationAccess ─────────────────────────────────────────────────

describe("assertConversationAccess", () => {
  it("passes when conversation belongs to user's project", () => {
    expect(() => assertConversationAccess(adminSession, "project_001")).not.toThrow();
    expect(() => assertConversationAccess(memberSession, "project_001")).not.toThrow();
  });

  it("throws when conversation belongs to a different project", () => {
    expect(() => assertConversationAccess(adminSession, "project_002")).toThrow(
      AuthorizationError
    );
  });

  it("throws with FORBIDDEN in the message", () => {
    expect(() => assertConversationAccess(memberSession, "project_002")).toThrow(/FORBIDDEN/);
  });

  it("throws when other-project user tries to access project_001 conversation", () => {
    expect(() => assertConversationAccess(otherProjectSession, "project_001")).toThrow(
      AuthorizationError
    );
  });
});

// ─── canAccessProject ─────────────────────────────────────────────────────────

describe("canAccessProject", () => {
  it("returns true when projectIds match", () => {
    expect(canAccessProject(adminSession, "project_001")).toBe(true);
    expect(canAccessProject(memberSession, "project_001")).toBe(true);
  });

  it("returns false when projectIds differ", () => {
    expect(canAccessProject(otherProjectSession, "project_001")).toBe(false);
    expect(canAccessProject(adminSession, "project_002")).toBe(false);
  });
});

// ─── canAccessConversation ────────────────────────────────────────────────────

describe("canAccessConversation", () => {
  it("returns true when conversation belongs to user's project", () => {
    expect(canAccessConversation(adminSession, "project_001")).toBe(true);
    expect(canAccessConversation(memberSession, "project_001")).toBe(true);
  });

  it("returns false when conversation belongs to a different project", () => {
    expect(canAccessConversation(adminSession, "project_002")).toBe(false);
    expect(canAccessConversation(otherProjectSession, "project_001")).toBe(false);
  });
});

// ─── isAdmin ──────────────────────────────────────────────────────────────────

describe("isAdmin", () => {
  it("returns true for admin role", () => {
    expect(isAdmin(adminSession)).toBe(true);
  });

  it("returns false for member role", () => {
    expect(isAdmin(memberSession)).toBe(false);
    expect(isAdmin(otherProjectSession)).toBe(false);
  });
});

// ─── canAccessAdminDashboard ──────────────────────────────────────────────────

describe("canAccessAdminDashboard", () => {
  it("returns true for admin in the correct project", () => {
    expect(canAccessAdminDashboard(adminSession, "project_001")).toBe(true);
  });

  it("returns false for member even in the correct project", () => {
    expect(canAccessAdminDashboard(memberSession, "project_001")).toBe(false);
  });

  it("returns false for admin in a different project", () => {
    expect(canAccessAdminDashboard(adminSession, "project_002")).toBe(false);
  });

  it("returns false for member in a different project", () => {
    expect(canAccessAdminDashboard(otherProjectSession, "project_001")).toBe(false);
  });
});
