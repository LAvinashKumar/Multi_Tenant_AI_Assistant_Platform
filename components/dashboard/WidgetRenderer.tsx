/**
 * WidgetRenderer — the core of the config-driven dashboard.
 *
 * Maps widget names (strings from DB) to React components.
 * To add a new widget:
 *   1. Add its data computation in dashboard.service.ts
 *   2. Add its component here in the WIDGET_MAP
 *   3. Add its name to the DashboardConfig in MongoDB
 *   NO other code changes needed.
 */

import { StatWidget } from "./widgets/StatWidget";
import { IntegrationStatusWidget } from "./widgets/IntegrationStatusWidget";
import { WidgetData } from "@/hooks/useDashboard";

interface WidgetRendererProps {
  widgetName: string;
  widgetData: WidgetData;
}

/**
 * Registry mapping widget name strings → React components.
 * This is the only place that connects DB config to UI components.
 */
const WIDGET_MAP: Record<
  string,
  React.ComponentType<{ data: unknown }>
> = {
  userCount: StatWidget as React.ComponentType<{ data: unknown }>,
  messageCount: StatWidget as React.ComponentType<{ data: unknown }>,
  conversationCount: StatWidget as React.ComponentType<{ data: unknown }>,
  integrationStatus: IntegrationStatusWidget as React.ComponentType<{ data: unknown }>,
};

export function WidgetRenderer({ widgetName, widgetData }: WidgetRendererProps) {
  const WidgetComponent = WIDGET_MAP[widgetName];
  const data = widgetData[widgetName];

  if (!WidgetComponent) {
    return (
      <div
        data-testid={`widget-unknown-${widgetName}`}
        className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-400"
      >
        Unknown widget: <code className="font-mono">{widgetName}</code>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div
        data-testid={`widget-no-data-${widgetName}`}
        className="rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-400"
      >
        No data for widget: {widgetName}
      </div>
    );
  }

  return <WidgetComponent data={data} />;
}
