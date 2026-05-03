/**
 * GET  /api/session — returns the current mock session
 * POST /api/session — switches the mock user (for demo purposes)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/access/session";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getSession();
    return successResponse(session);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const body = await req.json();
    const { userId } = body as { userId: string };

    const validUsers = ["user_admin_001", "user_member_001", "user_member_002"];
    if (!validUsers.includes(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user" }, { status: 400 });
    }

    const response = successResponse({ switched: true, userId });
    response.cookies.set("mock_user_id", userId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  });
}
