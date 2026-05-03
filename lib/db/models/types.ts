/**
 * Plain (non-Document) types for use with Mongoose .lean() results.
 * These avoid the FlattenMaps<Document> type mismatch that occurs when
 * returning .lean() results typed as Mongoose Document interfaces.
 */

import { Types } from "mongoose";

export interface ProjectDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  role: "admin" | "member";
  projectId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationsDoc {
  shopify: boolean;
  crm: boolean;
}

export interface ProductInstanceDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  productType: "AI_ASSISTANT";
  integrations: IntegrationsDoc;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  productInstanceId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDoc {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  sender: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface DashboardSectionDoc {
  title: string;
  widgets: string[];
}

export interface DashboardConfigDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  sections: DashboardSectionDoc[];
  createdAt: Date;
  updatedAt: Date;
}
