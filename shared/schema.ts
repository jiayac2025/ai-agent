import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Agent source types
export const agentSourceTypes = ["built-in", "user-created", "community"] as const;
export type AgentSource = typeof agentSourceTypes[number];

// Agent status types
export const agentStatusTypes = ["active", "inactive", "testing", "archived"] as const;
export type AgentStatus = typeof agentStatusTypes[number];

// Task status types
export const taskStatusTypes = ["pending", "running", "completed", "failed", "cancelled"] as const;
export type TaskStatus = typeof taskStatusTypes[number];

// Tool types that agents can use
export const toolTypes = ["web-search", "code-execution", "file-access", "api-call", "data-analysis", "image-generation"] as const;
export type ToolType = typeof toolTypes[number];

// AI Model types
export const aiModelTypes = [
  "gpt-4",
  "gpt-4-turbo", 
  "gpt-3.5-turbo",
  "claude-3.5-sonnet",
  "claude-3-opus",
  "claude-3-haiku",
  "gemini-pro",
  "llama-3-70b"
] as const;
export type AIModel = typeof aiModelTypes[number];

export interface AIModelInfo {
  id: AIModel;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  costPer1kTokens: number;
}

// Agents table
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  source: text("source").notNull().$type<AgentSource>(),
  status: text("status").notNull().$type<AgentStatus>().default("active"),
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  tools: jsonb("tools").$type<ToolType[]>().default([]),
  inputSchema: jsonb("input_schema").$type<Record<string, any>>(),
  outputSchema: jsonb("output_schema").$type<Record<string, any>>(),
  category: text("category"),
  icon: text("icon"),
  createdBy: text("created_by"),
  rating: integer("rating").default(0),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().$type<TaskStatus>().default("pending"),
  agentIds: jsonb("agent_ids").$type<string[]>().notNull(),
  workflow: jsonb("workflow").$type<Record<string, any>>(),
  input: jsonb("input").$type<Record<string, any>>(),
  output: jsonb("output").$type<Record<string, any>>(),
  progress: integer("progress").default(0),
  executionTime: integer("execution_time"),
  cost: integer("cost").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Chat messages for task execution
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  agentId: varchar("agent_id"),
  role: text("role").notNull().$type<"user" | "agent" | "system">(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Templates (pre-built agents)
export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  agentConfig: jsonb("agent_config").$type<Partial<Agent>>().notNull(),
  icon: text("icon"),
  downloads: integer("downloads").default(0),
  rating: integer("rating").default(0),
  createdBy: text("created_by").notNull(),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  downloads: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Statistics and usage tracking
export interface AgentStatistics {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalCost: number;
  avgExecutionTime: number;
  apiCalls: number;
}

export interface UsageData {
  date: string;
  apiCalls: number;
  cost: number;
  tasks: number;
}

export interface AgentUsage {
  agentId: string;
  agentName: string;
  usageCount: number;
  successRate: number;
  avgExecutionTime: number;
  totalCost: number;
}
