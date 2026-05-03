/**
 * Zod validation schemas for all API inputs.
 * Used in API routes to validate query params and request bodies.
 */

import { z } from "zod";

// ─── Common ───────────────────────────────────────────────────────────────────

export const ObjectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

// ─── Conversation Schemas ─────────────────────────────────────────────────────

export const CreateConversationSchema = z.object({
  productInstanceId: ObjectIdSchema,
  title: z.string().min(1).max(100).optional(),
});

export const ConversationQuerySchema = z.object({
  projectId: ObjectIdSchema,
});

export const ConversationParamsSchema = z.object({
  conversationId: ObjectIdSchema,
});

// ─── Message Schemas ──────────────────────────────────────────────────────────

export const SendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(4000, "Message too long (max 4000 chars)"),
});

// ─── Dashboard Schemas ────────────────────────────────────────────────────────

export const DashboardSectionSchema = z.object({
  title: z.string().min(1).max(100),
  widgets: z.array(z.string().min(1)).min(1),
});

export const UpdateDashboardConfigSchema = z.object({
  sections: z.array(DashboardSectionSchema).min(1),
});

// ─── Integration Schemas ──────────────────────────────────────────────────────

export const UpdateIntegrationsSchema = z.object({
  shopify: z.boolean(),
  crm: z.boolean(),
});

// ─── Type exports ─────────────────────────────────────────────────────────────

export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type UpdateDashboardConfigInput = z.infer<typeof UpdateDashboardConfigSchema>;
export type UpdateIntegrationsInput = z.infer<typeof UpdateIntegrationsSchema>;
