/**
 * GET  /api/dashboard — fetch config-driven dashboard data (admin only)
 * PUT  /api/dashboard — update dashboard config sections (admin only)
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/access/session";
import { assertAdminRole, assertProjectAccess } from "@/lib/access/authorization";
import { getDashboardData, updateDashboardConfig } from "@/lib/services/dashboard.service";
import { UpdateDashboardConfigSchema } from "@/lib/validations/schemas";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";
import type { DashboardSectionDoc } from "@/lib/db/models/types";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    assertAdminRole(session);
    assertProjectAccess(session, session.projectId);

    const data = await getDashboardData(session.projectId);
    return successResponse(data);
  });
}

export async function PUT(req: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    assertAdminRole(session);
    assertProjectAccess(session, session.projectId);

    const body = await req.json();
    const { sections } = UpdateDashboardConfigSchema.parse(body);

    const updated = await updateDashboardConfig(
      session.projectId,
      sections as DashboardSectionDoc[]
    );
    return successResponse(updated);
  });
}
