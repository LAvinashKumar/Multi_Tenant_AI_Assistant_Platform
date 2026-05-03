/**
 * DashboardView — config-driven admin dashboard.
 *
 * Fetches DashboardConfig from MongoDB via TanStack Query.
 * Iterates over sections and widgets from the DB config.
 * The layout is ENTIRELY driven by data — no hardcoded sections.
 *
 * To change the dashboard: update the DashboardConfig document in MongoDB.
 * No code changes needed.
 */

"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { WidgetRenderer } from "./WidgetRenderer";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { LayoutDashboard, RefreshCw, Database, Shield } from "lucide-react";

export function DashboardView() {
  const { data, isLoading, error, refetch, isFetching } = useDashboard();

  if (isLoading) return <LoadingPage />;

  if (error) {
    const isForbidden = error.message.includes("FORBIDDEN");
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md w-full text-center">
          {isForbidden ? (
            <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <Shield className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Access Denied</h2>
              <p className="mt-2 text-sm text-slate-500">
                Admin role required to view the dashboard.
              </p>
            </div>
          ) : (
            <ErrorMessage message={error.message} onRetry={refetch} />
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { config, widgetData } = data;

  return (
    <div data-testid="dashboard-view" className="h-full overflow-y-auto bg-slate-50">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Admin Dashboard</h1>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Database className="h-3 w-3" />
                Config-driven — edit MongoDB to change layout
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="p-6 space-y-8">
        {config.sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Database className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No sections configured</p>
            <p className="mt-1 text-xs text-slate-400">
              Add sections to the DashboardConfig document in MongoDB.
            </p>
          </div>
        )}

        {config.sections.map((section, idx) => (
          <section key={idx} data-testid={`dashboard-section-${idx}`}>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {section.title}
              </h2>
              <div className="flex-1 border-t border-slate-200" />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                {section.widgets.length} widget{section.widgets.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {section.widgets.map((widgetName) => (
                <WidgetRenderer
                  key={widgetName}
                  widgetName={widgetName}
                  widgetData={widgetData}
                />
              ))}
            </div>
          </section>
        ))}

        {/* ── Config Inspector ── */}
        <details className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="cursor-pointer select-none px-5 py-4 text-sm font-medium text-slate-600 hover:text-slate-800">
            <span className="mr-2">📋</span>
            Raw Dashboard Config (from MongoDB)
          </summary>
          <div className="border-t border-slate-100 px-5 pb-5 pt-3">
            <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-green-400">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
