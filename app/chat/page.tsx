/**
 * /chat — landing page when no conversation is selected.
 */

import { Bot, Zap, Shield, LayoutDashboard } from "lucide-react";

export default function ChatIndexPage() {
  return (
    <div
      data-testid="chat-index-page"
      className="flex h-full flex-col items-center justify-center gap-6 bg-slate-50 p-8 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
        <Bot className="h-10 w-10 text-white" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-800">AI Assistant</h1>
        <p className="mt-2 text-slate-500">
          Select a conversation or start a new one from the sidebar.
        </p>
      </div>

      <div className="grid max-w-lg gap-3 sm:grid-cols-3">
        {[
          {
            icon: <Shield className="h-5 w-5 text-blue-600" />,
            title: "Multi-Tenant",
            desc: "Strict project isolation per user",
          },
          {
            icon: <Zap className="h-5 w-5 text-emerald-600" />,
            title: "Smart Routing",
            desc: "Shopify & CRM integration simulation",
          },
          {
            icon: <LayoutDashboard className="h-5 w-5 text-violet-600" />,
            title: "Config Dashboard",
            desc: "MongoDB-driven admin layout",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
              {f.icon}
            </div>
            <p className="text-sm font-semibold text-slate-700">{f.title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
