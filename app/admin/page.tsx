/**
 * /admin — admin dashboard page.
 *
 * Server-side authorization: non-admins are redirected to /chat.
 * The sidebar is provided by the root layout wrapper below.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/access/session";
import { isAdmin } from "@/lib/access/authorization";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !isAdmin(session)) {
    redirect("/chat");
  }

  return <DashboardView />;
}
