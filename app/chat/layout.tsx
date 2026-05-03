/**
 * Chat layout — wraps all /chat/* pages with the sidebar.
 * The activeConversationId is handled client-side in the Sidebar via usePathname.
 */

import { Sidebar } from "@/components/layout/Sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
