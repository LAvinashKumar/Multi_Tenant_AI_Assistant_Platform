/**
 * IntegrationStatusWidget — shows Shopify and CRM integration status.
 * Admins can toggle integrations directly from the dashboard.
 */

"use client";

import { ShoppingBag, Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useUpdateIntegrations } from "@/hooks/useIntegrations";

interface IntegrationStatusData {
  label: string;
  shopify: boolean;
  crm: boolean;
  icon: string;
  color: string;
}

interface IntegrationStatusWidgetProps {
  data: IntegrationStatusData;
}

interface IntegrationRowProps {
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  onToggle: () => void;
  isPending: boolean;
  testId: string;
}

function IntegrationRow({
  label,
  description,
  enabled,
  icon,
  onToggle,
  isPending,
  testId,
}: IntegrationRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            enabled ? "bg-white shadow-sm" : "bg-slate-100"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{label}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {enabled ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-slate-300" />
        )}
        <button
          data-testid={testId}
          onClick={onToggle}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
            enabled ? "bg-emerald-500" : "bg-slate-300"
          }`}
          role="switch"
          aria-checked={enabled}
          aria-label={`Toggle ${label}`}
        >
          {isPending ? (
            <Loader2 className="absolute left-1 h-3 w-3 animate-spin text-white" />
          ) : (
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          )}
        </button>
      </div>
    </div>
  );
}

export function IntegrationStatusWidget({ data }: IntegrationStatusWidgetProps) {
  const updateMutation = useUpdateIntegrations();

  function toggle(key: "shopify" | "crm") {
    updateMutation.mutate({
      shopify: key === "shopify" ? !data.shopify : data.shopify,
      crm: key === "crm" ? !data.crm : data.crm,
    });
  }

  return (
    <div
      data-testid="widget-integration-status"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {data.label}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            data.shopify || data.crm
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {data.shopify || data.crm ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-2">
        <IntegrationRow
          label="Shopify"
          description={data.shopify ? "Returns mock order data" : "Uses AI API"}
          enabled={data.shopify}
          icon={<ShoppingBag className={`h-4 w-4 ${data.shopify ? "text-emerald-600" : "text-slate-400"}`} />}
          onToggle={() => toggle("shopify")}
          isPending={updateMutation.isPending}
          testId="toggle-shopify"
        />
        <IntegrationRow
          label="CRM"
          description={data.crm ? "Returns mock lead data" : "Uses AI API"}
          enabled={data.crm}
          icon={<Users className={`h-4 w-4 ${data.crm ? "text-blue-600" : "text-slate-400"}`} />}
          onToggle={() => toggle("crm")}
          isPending={updateMutation.isPending}
          testId="toggle-crm"
        />
      </div>

      {updateMutation.error && (
        <p className="mt-2 text-xs text-red-500">{updateMutation.error.message}</p>
      )}
    </div>
  );
}
