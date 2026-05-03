/**
 * API helper utilities for consistent error handling and responses.
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthorizationError } from "@/lib/access/authorization";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Wraps an API handler with standard error handling.
 * Catches AuthorizationError (403), ZodError (400), and generic errors (500).
 */
export function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  return handler().catch((err: unknown) => {
    if (err instanceof AuthorizationError) {
      return errorResponse(err.message, 403);
    }
    if (err instanceof ZodError) {
      return errorResponse(err.errors.map((e) => e.message).join(", "), 400);
    }
    if (err instanceof Error) {
      console.error("[API Error]", err.message);
      return errorResponse(err.message, 500);
    }
    return errorResponse("Unknown error", 500);
  });
}
