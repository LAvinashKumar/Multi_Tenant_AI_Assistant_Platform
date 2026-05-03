/**
 * GET /api/integrations  — get current integration flags
 * PUT /api/integrations  — update integration flags (admin only)
 */

import { NextRequest } from "next/server";
import { requireSession } from "@/lib/access/session";
import { assertAdminRole } from "@/lib/access/authorization";
import { getProductInstance, updateIntegrations } from "@/lib/services/project.service";
import { UpdateIntegrationsSchema } from "@/lib/validations/schemas";
import { successResponse, withErrorHandling } from "@/lib/api-helpers";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await requireSession();
    const instance = await getProductInstance(session.projectId);
    return successResponse(instance?.integrations ?? { shopify: false, crm: false });
  });
}

export async function PUT(req: NextRequest) {
  return withErrorHandling(async () => {
    const session = await requireSession();
    assertAdminRole(session);

    const body = await req.json();
    const integrations = UpdateIntegrationsSchema.parse(body);

    const updated = await updateIntegrations(session.projectId, integrations);
    return successResponse(updated.integrations);
  });
}
