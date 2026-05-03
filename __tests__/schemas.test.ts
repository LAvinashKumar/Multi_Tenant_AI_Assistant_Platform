/**
 * Unit tests for Zod validation schemas.
 */

import {
  CreateConversationSchema,
  SendMessageSchema,
  UpdateDashboardConfigSchema,
  UpdateIntegrationsSchema,
  ObjectIdSchema,
} from "../lib/validations/schemas";

// ─── ObjectIdSchema ───────────────────────────────────────────────────────────

describe("ObjectIdSchema", () => {
  it("accepts valid 24-char hex ObjectIds", () => {
    expect(() => ObjectIdSchema.parse("507f1f77bcf86cd799439011")).not.toThrow();
    expect(() => ObjectIdSchema.parse("000000000000000000000001")).not.toThrow();
  });

  it("rejects short strings", () => {
    expect(() => ObjectIdSchema.parse("abc123")).toThrow();
  });

  it("rejects non-hex strings", () => {
    expect(() => ObjectIdSchema.parse("gggggggggggggggggggggggg")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => ObjectIdSchema.parse("")).toThrow();
  });
});

// ─── CreateConversationSchema ─────────────────────────────────────────────────

describe("CreateConversationSchema", () => {
  const validId = "507f1f77bcf86cd799439011";

  it("accepts valid productInstanceId", () => {
    expect(() =>
      CreateConversationSchema.parse({ productInstanceId: validId })
    ).not.toThrow();
  });

  it("accepts optional title", () => {
    const result = CreateConversationSchema.parse({
      productInstanceId: validId,
      title: "My Chat",
    });
    expect(result.title).toBe("My Chat");
  });

  it("rejects missing productInstanceId", () => {
    expect(() => CreateConversationSchema.parse({})).toThrow();
  });

  it("rejects invalid productInstanceId", () => {
    expect(() =>
      CreateConversationSchema.parse({ productInstanceId: "not-an-id" })
    ).toThrow();
  });

  it("rejects title over 100 chars", () => {
    expect(() =>
      CreateConversationSchema.parse({
        productInstanceId: validId,
        title: "a".repeat(101),
      })
    ).toThrow();
  });
});

// ─── SendMessageSchema ────────────────────────────────────────────────────────

describe("SendMessageSchema", () => {
  it("accepts valid message content", () => {
    const result = SendMessageSchema.parse({ content: "Hello world" });
    expect(result.content).toBe("Hello world");
  });

  it("rejects empty content", () => {
    expect(() => SendMessageSchema.parse({ content: "" })).toThrow();
  });

  it("rejects content over 4000 chars", () => {
    expect(() =>
      SendMessageSchema.parse({ content: "a".repeat(4001) })
    ).toThrow();
  });

  it("accepts content at exactly 4000 chars", () => {
    expect(() =>
      SendMessageSchema.parse({ content: "a".repeat(4000) })
    ).not.toThrow();
  });

  it("rejects missing content field", () => {
    expect(() => SendMessageSchema.parse({})).toThrow();
  });
});

// ─── UpdateDashboardConfigSchema ──────────────────────────────────────────────

describe("UpdateDashboardConfigSchema", () => {
  it("accepts valid sections", () => {
    const result = UpdateDashboardConfigSchema.parse({
      sections: [
        { title: "Overview", widgets: ["userCount", "messageCount"] },
      ],
    });
    expect(result.sections).toHaveLength(1);
    expect(result.sections[0].widgets).toContain("userCount");
  });

  it("rejects empty sections array", () => {
    expect(() =>
      UpdateDashboardConfigSchema.parse({ sections: [] })
    ).toThrow();
  });

  it("rejects section with empty widgets array", () => {
    expect(() =>
      UpdateDashboardConfigSchema.parse({
        sections: [{ title: "Overview", widgets: [] }],
      })
    ).toThrow();
  });

  it("rejects section with empty title", () => {
    expect(() =>
      UpdateDashboardConfigSchema.parse({
        sections: [{ title: "", widgets: ["userCount"] }],
      })
    ).toThrow();
  });
});

// ─── UpdateIntegrationsSchema ─────────────────────────────────────────────────

describe("UpdateIntegrationsSchema", () => {
  it("accepts valid integration flags", () => {
    const result = UpdateIntegrationsSchema.parse({ shopify: true, crm: false });
    expect(result.shopify).toBe(true);
    expect(result.crm).toBe(false);
  });

  it("rejects non-boolean values", () => {
    expect(() =>
      UpdateIntegrationsSchema.parse({ shopify: "yes", crm: false })
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => UpdateIntegrationsSchema.parse({ shopify: true })).toThrow();
    expect(() => UpdateIntegrationsSchema.parse({})).toThrow();
  });
});
