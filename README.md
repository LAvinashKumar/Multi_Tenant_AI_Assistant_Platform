# AI Assistant — Multi-Tenant Full-Stack App

A production-ready multi-tenant AI assistant with an admin dashboard, built with Next.js 14 (App Router), MongoDB, and the Gemini API.

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Free API key from [aistudio.google.com](https://aistudio.google.com/) |
| `MOCK_USER_ID` | Default session user (`user_admin_001` for admin) |
| `NEXT_PUBLIC_PRODUCT_INSTANCE_ID` | Set this after running seed (see below) |

### 4. Seed the database

```bash
npm run seed
```

This creates:
- 2 Projects (Acme Corp, TechStart)
- 3 Users (1 admin + 2 members across projects)
- 2 ProductInstances with integration flags
- Dashboard configs for each project
- Sample conversations and messages

The seed script prints the `ProductInstance` ID — copy it into `.env.local`:

```
NEXT_PUBLIC_PRODUCT_INSTANCE_ID=<printed_id>
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

### Layered Architecture (strictly enforced)

```
┌─────────────────────────────────────────────────────┐
│  UI Components  (no DB, no business logic)          │
│  /components/**                                     │
├─────────────────────────────────────────────────────┤
│  Client Hooks   (TanStack Query — no direct fetch)  │
│  /hooks/**                                          │
├─────────────────────────────────────────────────────┤
│  API Routes     (thin controllers — validate + auth)│
│  /app/api/**                                        │
├─────────────────────────────────────────────────────┤
│  Service Layer  (business logic + DB + AI calls)    │
│  /lib/services/**                                   │
├─────────────────────────────────────────────────────┤
│  Access Layer   (pure authorization logic)          │
│  /lib/access/**                                     │
├─────────────────────────────────────────────────────┤
│  DB Models      (Mongoose schemas)                  │
│  /lib/db/models/**                                  │
└─────────────────────────────────────────────────────┘
```

**Rule**: Each layer only calls the layer directly below it. UI never touches the DB.

### Folder Structure

```
ai-assistant-app/
├── app/
│   ├── api/
│   │   ├── conversations/          # CRUD + message sending
│   │   │   └── [conversationId]/
│   │   │       └── messages/       # GET + POST messages
│   │   ├── dashboard/              # Config-driven dashboard API
│   │   ├── integrations/           # Integration flag management
│   │   └── session/                # Mock session API
│   ├── admin/                      # Admin dashboard page (server auth check)
│   ├── chat/
│   │   └── [conversationId]/       # Individual conversation page
│   └── settings/                   # Integration settings page
├── components/
│   ├── chat/                       # ChatWindow, MessageBubble, MessageInput
│   ├── dashboard/                  # DashboardView, WidgetRenderer, widgets/
│   ├── layout/                     # Sidebar, UserSwitcher
│   ├── settings/                   # IntegrationsSettings
│   └── ui/                         # LoadingSpinner, ErrorMessage, EmptyState
├── hooks/                          # TanStack Query hooks (useConversations, etc.)
├── lib/
│   ├── access/                     # session.ts, authorization.ts
│   ├── db/
│   │   └── models/                 # Mongoose models + plain types
│   ├── services/                   # ai, conversation, dashboard, project services
│   └── validations/                # Zod schemas
├── scripts/
│   └── seed.ts                     # Database seeder
└── __tests__/                      # Unit tests
```

---

## Config-Driven Dashboard

The admin dashboard layout is **entirely driven by MongoDB** — no code changes needed to reconfigure it.

### How it works

1. `DashboardConfig` document in MongoDB stores sections and widget names:

```json
{
  "projectId": "...",
  "sections": [
    { "title": "Overview", "widgets": ["userCount", "messageCount", "conversationCount"] },
    { "title": "Integrations", "widgets": ["integrationStatus"] }
  ]
}
```

2. The `DashboardView` component fetches this config and iterates over sections/widgets.

3. `WidgetRenderer` maps widget name strings → React components via a registry:

```ts
const WIDGET_MAP = {
  userCount: StatWidget,
  messageCount: StatWidget,
  integrationStatus: IntegrationStatusWidget,
  // Add new widgets here — no other changes needed
};
```

4. Widget data is computed server-side in `dashboard.service.ts`.

### To add a new widget

1. Add data computation in `lib/services/dashboard.service.ts` → `computeWidgetData()`
2. Create a component in `components/dashboard/widgets/`
3. Register it in `components/dashboard/WidgetRenderer.tsx` → `WIDGET_MAP`
4. Add its name to the `DashboardConfig` document in MongoDB

**No layout changes, no hardcoded sections.**

---

## Multi-Tenant Data Model

```
Project (tenant boundary)
  └── Users (role: admin | member)
  └── ProductInstance (integrations: shopify, crm)
      └── Conversations
          └── Messages
  └── DashboardConfig (sections + widgets)
```

Every resource is scoped to a `projectId`. The access layer enforces that users can only access their own project.

---

## Authentication (Mock)

For demo purposes, authentication uses a hardcoded session map. Switch users via the sidebar switcher or by POSTing to `/api/session`:

```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_admin_001"}'
```

Available mock users:

| userId | Name | Role | Project |
|---|---|---|---|
| `user_admin_001` | Alice Admin | admin | project_001 |
| `user_member_001` | Bob Member | member | project_001 |
| `user_member_002` | Carol Other | member | project_002 |

---

## AI Integration

AI calls are **only made from `lib/services/ai.service.ts`**. The flow:

```
User sends message
       ↓
Check ProductInstance.integrations
       ↓
shopify=true  → return mock order data  (no AI call)
crm=true      → return mock lead data   (no AI call)
neither       → call Gemini API
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com/). Without a key, the app runs in demo mode with a placeholder response.

---

## Running Tests

```bash
npm test
```

Tests cover:
- **Authorization rules** — all `assertProjectAccess`, `assertAdminRole`, `canAccessAdminDashboard` cases
- **Zod schemas** — valid/invalid inputs for all API endpoints

---

## Environment Variables Reference

```env
# Required
MONGODB_URI=mongodb://localhost:27017/ai-assistant

# AI (get free key at https://aistudio.google.com/)
GEMINI_API_KEY=your_key_here

# Mock session (set after running seed)
MOCK_USER_ID=user_admin_001
NEXT_PUBLIC_PRODUCT_INSTANCE_ID=<from_seed_output>
```
