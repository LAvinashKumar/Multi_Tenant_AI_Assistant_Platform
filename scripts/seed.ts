/**
 * Database seed script.
 * Run with: npm run seed
 *
 * Creates:
 *  - 2 Projects (project_001, project_002)
 *  - 3 Users (1 admin + 2 members)
 *  - 2 ProductInstances
 *  - 1 DashboardConfig per project
 *  - Sample conversations and messages
 */

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/ai-assistant";

// ─── Inline model definitions (avoid Next.js module issues in scripts) ────────

const ProjectSchema = new mongoose.Schema(
  { name: String, slug: String },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  { name: String, role: String, projectId: mongoose.Schema.Types.ObjectId },
  { timestamps: true }
);

const ProductInstanceSchema = new mongoose.Schema(
  {
    projectId: mongoose.Schema.Types.ObjectId,
    productType: { type: String, default: "AI_ASSISTANT" },
    integrations: { shopify: { type: Boolean, default: false }, crm: { type: Boolean, default: false } },
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    projectId: mongoose.Schema.Types.ObjectId,
    productInstanceId: mongoose.Schema.Types.ObjectId,
    title: String,
  },
  { timestamps: true }
);

const MessageSchema = new mongoose.Schema(
  {
    conversationId: mongoose.Schema.Types.ObjectId,
    sender: String,
    content: String,
  },
  { timestamps: true }
);

const DashboardConfigSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, unique: true },
    sections: [
      {
        title: String,
        widgets: [String],
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  // Register models
  const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const ProductInstance = mongoose.models.ProductInstance || mongoose.model("ProductInstance", ProductInstanceSchema);
  const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema);
  const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
  const DashboardConfig = mongoose.models.DashboardConfig || mongoose.model("DashboardConfig", DashboardConfigSchema);

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    Project.deleteMany({}),
    User.deleteMany({}),
    ProductInstance.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    DashboardConfig.deleteMany({}),
  ]);

  // ─── Projects ───────────────────────────────────────────────────────────────
  console.log("📁 Creating projects...");
  const project1 = await Project.create({ name: "Acme Corp", slug: "acme-corp" });
  const project2 = await Project.create({ name: "TechStart", slug: "techstart" });
  console.log(`   Project 1: ${project1._id} (${project1.name})`);
  console.log(`   Project 2: ${project2._id} (${project2.name})`);

  // ─── Users ───────────────────────────────────────────────────────────────────
  console.log("👥 Creating users...");
  const adminUser = await User.create({
    name: "Alice Admin",
    role: "admin",
    projectId: project1._id,
  });
  const memberUser = await User.create({
    name: "Bob Member",
    role: "member",
    projectId: project1._id,
  });
  const otherUser = await User.create({
    name: "Carol Other",
    role: "member",
    projectId: project2._id,
  });
  console.log(`   Admin: ${adminUser._id} (${adminUser.name})`);
  console.log(`   Member: ${memberUser._id} (${memberUser.name})`);
  console.log(`   Other: ${otherUser._id} (${otherUser.name})`);

  // ─── Product Instances ────────────────────────────────────────────────────────
  console.log("🤖 Creating product instances...");
  const instance1 = await ProductInstance.create({
    projectId: project1._id,
    productType: "AI_ASSISTANT",
    integrations: { shopify: false, crm: false },
  });
  const instance2 = await ProductInstance.create({
    projectId: project2._id,
    productType: "AI_ASSISTANT",
    integrations: { shopify: true, crm: false },
  });
  console.log(`   Instance 1: ${instance1._id} (project 1, no integrations)`);
  console.log(`   Instance 2: ${instance2._id} (project 2, shopify enabled)`);

  // ─── Dashboard Configs ────────────────────────────────────────────────────────
  console.log("📊 Creating dashboard configs...");
  await DashboardConfig.create({
    projectId: project1._id,
    sections: [
      {
        title: "Overview",
        widgets: ["userCount", "messageCount", "conversationCount"],
      },
      {
        title: "Integrations",
        widgets: ["integrationStatus"],
      },
    ],
  });
  await DashboardConfig.create({
    projectId: project2._id,
    sections: [
      {
        title: "Stats",
        widgets: ["userCount", "messageCount"],
      },
    ],
  });
  console.log("   Dashboard configs created");

  // ─── Sample Conversations & Messages ─────────────────────────────────────────
  console.log("💬 Creating sample conversations...");
  const conv1 = await Conversation.create({
    projectId: project1._id,
    productInstanceId: instance1._id,
    title: "Getting started with AI",
  });
  const conv2 = await Conversation.create({
    projectId: project1._id,
    productInstanceId: instance1._id,
    title: "Product questions",
  });

  await Message.create([
    {
      conversationId: conv1._id,
      sender: "user",
      content: "Hello! What can you help me with?",
    },
    {
      conversationId: conv1._id,
      sender: "assistant",
      content:
        "Hi! I'm your AI assistant. I can help you with questions, analysis, writing, and more. What would you like to explore today?",
    },
    {
      conversationId: conv1._id,
      sender: "user",
      content: "Tell me about this application.",
    },
    {
      conversationId: conv1._id,
      sender: "assistant",
      content:
        "This is a multi-tenant AI assistant built with Next.js, MongoDB, and the Gemini API. It features a config-driven admin dashboard, integration simulation (Shopify & CRM), and strict layered architecture with access control.",
    },
  ]);

  await Message.create([
    {
      conversationId: conv2._id,
      sender: "user",
      content: "What integrations are available?",
    },
    {
      conversationId: conv2._id,
      sender: "assistant",
      content:
        "Currently available integrations:\n\n• **Shopify** — Returns mock order data when enabled\n• **CRM** — Returns mock lead data when enabled\n\nYou can toggle these in the Settings page or Admin Dashboard.",
    },
  ]);

  console.log(`   Conversations: ${conv1._id}, ${conv2._id}`);

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete!");
  console.log("\n📋 Mock Session IDs (use in cookie 'mock_user_id'):");
  console.log("   user_admin_001  → Alice Admin (admin, project 1)");
  console.log("   user_member_001 → Bob Member (member, project 1)");
  console.log("   user_member_002 → Carol Other (member, project 2)");
  console.log("\n🔑 Important IDs:");
  console.log(`   Project 1 ID: ${project1._id}`);
  console.log(`   ProductInstance 1 ID: ${instance1._id}`);
  console.log("\n💡 Update NEXT_PUBLIC_PRODUCT_INSTANCE_ID in .env.local:");
  console.log(`   NEXT_PUBLIC_PRODUCT_INSTANCE_ID=${instance1._id}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
