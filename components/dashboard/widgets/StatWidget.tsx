/**
 * StatWidget — displays a numeric stat (user count, message count, etc.)
 * with an icon, label, and color accent.
 */

import { Users, MessageSquare, MessagesSquare, Plug, TrendingUp } from "lucide-react";

interface StatWidgetData {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface StatWidgetProps {
  data: StatWidgetData;
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-5 w-5" />,
  "message-square": <MessageSquare className="h-5 w-5" />,
  "messages-square": <MessagesSquare className="h-5 w-5" />,
  plug: <Plug className="h-5 w-5" />,
  trending: <TrendingUp className="h-5 w-5" />,
};

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-100" },
  green:  { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-600", ring: "ring-orange-100" },
  red:    { bg: "bg-red-50",    text: "text-red-600",    ring: "ring-red-100" },
};

export function StatWidget({ data }: StatWidgetProps) {
  const color = colorMap[data.color] ?? colorMap.blue;
  const icon = iconMap[data.icon] ?? iconMap["message-square"];

  return (
    <div
      data-testid={`widget-stat-${data.label.replace(/\s+/g, "-").toLowerCase()}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {data.label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
            {data.value.toLocaleString()}
          </p>
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ${color.bg} ${color.text} ${color.ring}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
