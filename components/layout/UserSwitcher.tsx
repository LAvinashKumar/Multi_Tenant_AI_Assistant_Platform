/**
 * UserSwitcher — demo component to switch between mock users.
 * Shows current user and allows switching for testing different roles/tenants.
 */

"use client";

import { useSession, useSwitchUser } from "@/hooks/useSession";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChevronDown, Shield, User } from "lucide-react";
import { useState } from "react";

const MOCK_USERS = [
  { id: "user_admin_001", label: "Alice Admin", role: "admin", project: "Acme Corp" },
  { id: "user_member_001", label: "Bob Member", role: "member", project: "Acme Corp" },
  { id: "user_member_002", label: "Carol Other", role: "member", project: "TechStart" },
];

export function UserSwitcher() {
  const { data: session } = useSession();
  const switchMutation = useSwitchUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" data-testid="user-switcher">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-800"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-600 text-slate-200">
          {session?.role === "admin" ? (
            <Shield className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-xs font-medium text-slate-200">
            {session?.name ?? "Loading…"}
          </p>
          <p className="text-[10px] text-slate-500 capitalize">{session?.role}</p>
        </div>
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Switch User (Demo)
          </p>
          {MOCK_USERS.map((u) => {
            const isCurrent = session?.userId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  if (!isCurrent) switchMutation.mutate(u.id);
                  setOpen(false);
                }}
                disabled={switchMutation.isPending || isCurrent}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  isCurrent
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-600">
                  {u.role === "admin" ? (
                    <Shield className="h-2.5 w-2.5 text-blue-400" />
                  ) : (
                    <User className="h-2.5 w-2.5 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{u.label}</p>
                  <p className="text-[10px] text-slate-500">
                    {u.role} · {u.project}
                  </p>
                </div>
                {isCurrent && (
                  <span className="ml-auto text-[10px] text-blue-400">active</span>
                )}
              </button>
            );
          })}
          {switchMutation.isPending && (
            <div className="flex justify-center py-2">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
