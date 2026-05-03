/**
 * Sidebar — conversation list + navigation.
 *
 * - Derives active conversation from URL via usePathname
 * - Uses TanStack Query hooks exclusively (no direct fetch)
 * - Optimistic create/delete (no extra GET after mutation)
 */

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Trash2,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles,
} from "lucide-react";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
} from "@/hooks/useConversations";
import { useSession } from "@/hooks/useSession";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UserSwitcher } from "./UserSwitcher";

const PRODUCT_INSTANCE_ID =
  process.env.NEXT_PUBLIC_PRODUCT_INSTANCE_ID ?? "000000000000000000000002";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: session } = useSession();
  const { data: conversations, isLoading, error } = useConversations();
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();

  const activeConversationId = pathname?.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  async function handleNewConversation() {
    const conv = await createMutation.mutateAsync({ productInstanceId: PRODUCT_INSTANCE_ID });
    router.push(`/chat/${conv._id}`);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    e.preventDefault();
    setDeletingId(id);
    await deleteMutation.mutateAsync(id);
    setDeletingId(null);
    if (activeConversationId === id) router.push("/chat");
  }

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside
      data-testid="sidebar"
      className={`sidebar-transition flex h-full flex-col border-r border-slate-200 bg-slate-900 text-slate-100 ${
        collapsed ? "w-[60px]" : "w-[260px]"
      }`}
    >
      {/* ── Header ── */}
      <div className="flex h-14 items-center justify-between border-b border-slate-700/60 px-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">AI Assistant</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ── New Chat Button ── */}
      <div className="p-2.5">
        <button
          data-testid="new-conversation-btn"
          onClick={handleNewConversation}
          disabled={createMutation.isPending}
          title={collapsed ? "New Chat" : undefined}
          className={`flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {createMutation.isPending ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Plus className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* ── Conversation List ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2" aria-label="Conversations">
        {!collapsed && (
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Conversations
          </p>
        )}

        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {error && !collapsed && (
          <p className="px-2 py-2 text-xs text-red-400">Failed to load</p>
        )}

        {!isLoading && conversations?.length === 0 && !collapsed && (
          <div className="px-2 py-4 text-center">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-slate-600" />
            <p className="text-xs text-slate-500">No conversations yet</p>
          </div>
        )}

        <ul className="space-y-0.5">
          {conversations?.map((conv) => {
            const active = activeConversationId === conv._id;
            return (
              <li key={conv._id}>
                <a
                  href={`/chat/${conv._id}`}
                  data-testid={`conversation-item-${conv._id}`}
                  title={collapsed ? conv.title : undefined}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    active
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-xs">{conv.title}</span>
                      <button
                        onClick={(e) => handleDelete(e, conv._id)}
                        disabled={deletingId === conv._id}
                        className="hidden rounded p-0.5 text-slate-500 hover:text-red-400 group-hover:block transition-colors"
                        aria-label="Delete conversation"
                      >
                        {deletingId === conv._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Bottom Navigation ── */}
      <div className="border-t border-slate-700/60 p-2 space-y-0.5">
        {session?.role === "admin" && (
          <a
            href="/admin"
            data-testid="admin-dashboard-link"
            title={collapsed ? "Admin Dashboard" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
              isActive("/admin")
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="text-xs">Admin Dashboard</span>}
          </a>
        )}
        <a
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
            pathname === "/settings"
              ? "bg-slate-700 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-xs">Settings</span>}
        </a>

        {!collapsed && (
          <div className="pt-1">
            <UserSwitcher />
          </div>
        )}
      </div>
    </aside>
  );
}
