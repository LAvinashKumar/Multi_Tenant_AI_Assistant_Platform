/**
 * Settings layout — wraps settings pages with the sidebar.
 */

import { Sidebar } from "@/components/layout/Sidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
