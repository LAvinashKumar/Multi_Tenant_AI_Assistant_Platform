# 🚀 Multi-Tenant AI Assistant Platform

A **production-grade, multi-tenant AI assistant SaaS** with a **MongoDB-driven admin dashboard**, built using Next.js 14, TypeScript, and modern full-stack architecture principles.

---

## 🌟 Why This Project Stands Out

This is not just a chat app.

It demonstrates:

* ✅ Multi-tenant system design (real SaaS architecture)
* ✅ Strict layered backend architecture
* ✅ Config-driven UI (admin dashboard powered by MongoDB)
* ✅ Controlled AI + fallback system (production reliability)
* ✅ Clean separation of concerns across the stack

---

## 🧠 Core Features

### 💬 AI Chat Assistant

* Real-time chat interface
* Controlled AI flow with:

  * Integration-based responses (Shopify / CRM)
  * AI API fallback handling (rate-limit safe)
* Messages persisted per conversation

---

### 🏢 Multi-Tenant Architecture

* Projects act as tenant boundaries
* Each project has:

  * Users (admin / member)
  * Product instances
  * Conversations & messages
  * Independent dashboard config

👉 Complete data isolation between tenants

---

### 📊 Config-Driven Admin Dashboard (Highlight Feature)

* Dashboard layout is **fully controlled via MongoDB**
* No frontend code changes required

Example config:

```json
{
  "sections": [
    { "title": "Overview", "widgets": ["userCount", "messageCount"] },
    { "title": "Integrations", "widgets": ["integrationStatus"] }
  ]
}
```

👉 Modify DB → UI updates instantly

---

### 🔐 Server-Side Authorization

* Strict access enforcement:

  * Users can only access their project
  * Admin-only dashboard protection
* Implemented via dedicated Access Layer

---

### ⚙️ Integration Simulation

* Shopify → simulated order data
* CRM → simulated lead data
* Toggle per product instance

---

### 🤖 Resilient AI System (Production Ready)

Handles real-world failures:

* Retry mechanism
* Rate-limit handling
* Fallback responses when AI fails

👉 Ensures chat never breaks

---

## 🏗️ Architecture (Strictly Layered)

```
Access → Services → API Routes → Hooks → UI
```

### Responsibilities:

* **Access Layer** → Authorization rules
* **Service Layer** → Business logic + DB + AI
* **Routes** → Thin controllers
* **Hooks** → Data fetching (TanStack Query)
* **UI** → Pure presentation

🚫 No DB calls in UI
🚫 No business logic in routes

---

## 🧩 Tech Stack

* **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
* **Backend**: Next.js Route Handlers
* **Database**: MongoDB + Mongoose
* **Validation**: Zod
* **State Management**: TanStack Query
* **AI**: Gemini / OpenRouter (with fallback handling)

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

---

### 2. Configure environment variables

```env
MONGODB_URI=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
MOCK_USER_ID=user_admin_001
NEXT_PUBLIC_PRODUCT_INSTANCE_ID=
```

---

### 3. Seed database

```bash
npm run seed
```

---

### 4. Run the app

```bash
npm run dev
```

---

## 🎥 Demo Highlights

* Chat system with AI + fallback
* Multi-tenant isolation
* Admin dashboard
* 🔥 Live MongoDB edit → instant UI change

---

## 🧠 Key Design Decisions

* **Config-driven UI** → Enables dynamic dashboards without redeploy
* **Layered architecture** → Improves scalability and maintainability
* **AI fallback system** → Ensures reliability under rate limits
* **Multi-tenant model** → Mirrors real SaaS systems

---

## 🧪 Testing

```bash
npm test
```

Covers:

* Authorization logic
* Zod validation schemas

---

## ⚠️ Assumptions

* Authentication is mocked for demo simplicity
* Integrations (Shopify/CRM) are simulated
* AI responses may fallback when API limits are hit

---

## 🌐 Deployment

Deployed on Vercel
Database hosted on MongoDB Atlas

---

## 👨‍💻 Author

Built as part of a full-stack engineering assignment focusing on **real-world product architecture and system design**.

---

## ⭐ Final Note

This project focuses on **engineering thinking over UI polish** — demonstrating how scalable systems are designed, structured, and made resilient.

---
