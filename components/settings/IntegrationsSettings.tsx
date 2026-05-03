/**
 * IntegrationsSettings — settings page for managing integration flags.
 * Shows current state and allows admins to toggle integrations.
 */

"use client";

import { useIntegrations, useUpdateIntegrations } from "@/hooks/useIntegrations";
import { useSession } from "@/hooks/useSession";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  ShoppingBag,
  Users,
  Settings,
  Info,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
} from "lucide-react";

export function IntegrationsSettings() {
  const { data: session } = useSession();
  const { data: integrations, isLoading, error, refetch } = useIntegrations();
  const updateMutation = useUpdateIntegrations();

  if (isLoading) return <LoadingPage />;
  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error.message} onRetry={refetch} />
      </div>
    );
  }

  const isAdminUser = session?.role === "admin";

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Settings</h1>
            <p className="text-xs text-slate-500">Manage integrations and AI behavior</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl p-6 space-y-5">
        {/* ── Info Banner ── */}
        <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold">How integrations affect AI responses</p>
            <p className="mt-1 text-blue-600/80">
              When an integration is enabled, the AI returns simulated data from that system
              instead of calling the AI API. This demonstrates the controlled flow pattern.
            </p>
          </div>
        </div>

        {/* ── Shopify ── */}
        <IntegrationCard
          title="Shopify Integration"
          description="When enabled, AI responses return mock order data instead of calling the AI API."
          icon={<ShoppingBag className="h-5 w-5" />}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          enabled={integrations?.shopify ?? false}
          isAdmin={isAdminUser}
          isPending={updateMutation.isPending}
          onToggle={() =>
            updateMutation.mutate({
              shopify: !integrations?.shopify,
              crm: integrations?.crm ?? false,
            })
          }
          testId="settings-toggle-shopify"
          mockDataLabel="Mock: Returns recent Shopify orders"
        />

        {/* ── CRM ── */}
        <IntegrationCard
          title="CRM Integration"
          description="When enabled, AI responses return mock lead data instead of calling the AI API."
          icon={<Users className="h-5 w-5" />}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          enabled={integrations?.crm ?? false}
          isAdmin={isAdminUser}
          isPending={updateMutation.isPending}
          onToggle={() =>
            updateMutation.mutate({
              shopify: integrations?.shopify ?? false,
              crm: !integrations?.crm,
            })
          }
          testId="settings-toggle-crm"
          mockDataLabel="Mock: Returns CRM leads and pipeline"
        />

        {updateMutation.error && (
          <ErrorMessage message={updateMutation.error.message} />
        )}

        {!isAdminUser && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <Lock className="h-4 w-4 shrink-0" />
            Integration toggles are restricted to admin users.
          </div>
        )}
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  enabled: boolean;
  isAdmin: boolean;
  isPending: boolean;
  onToggle: () => void;
  testId: string;
  mockDataLabel: string;
}

function IntegrationCard({
  title,
  description,
  icon,
  iconColor,
  iconBg,
  enabled,
  isAdmin,
  isPending,
  onToggle,
  testId,
  mockDataLabel,
}: IntegrationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${iconBg} ${iconColor}`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
            <div className="mt-3 flex items-center gap-2">
              {enabled ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-300" />
              )}
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  enabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {enabled ? "Enabled" : "Disabled"}
              </span>
              {enabled && (
                <span className="text-xs text-slate-400">{mockDataLabel}</span>
              )}
            </div>
          </div>
        </div>

        {isAdmin ? (
          <button
            data-testid={testId}
            onClick={onToggle}
            disabled={isPending}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
              enabled ? "bg-emerald-500" : "bg-slate-300"
            }`}
            role="switch"
            aria-checked={enabled}
          >
            {isPending ? (
              <Loader2 className="absolute left-1.5 h-3 w-3 animate-spin text-white" />
            ) : (
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            )}
          </button>
        ) : (
          <Lock className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
        )}
      </div>
    </div>
  );
}
