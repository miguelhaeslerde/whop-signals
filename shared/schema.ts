import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  whopUserId: varchar("whop_user_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  role: text("role").notNull().$type<"ADMIN" | "SUBSCRIBER">(),
  productId: varchar("product_id"),
  membershipId: varchar("membership_id"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export const signals = pgTable("signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  side: text("side").notNull().$type<"BUY" | "SELL" | "BUY_LIMIT" | "SELL_LIMIT">(),
  instrument: text("instrument").notNull(),
  entry: decimal("entry", { precision: 12, scale: 5 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 12, scale: 5 }).notNull(),
  takeProfits: json("take_profits").$type<Array<{ price: string; ratio: string }>>().notNull(),
  riskTag: text("risk_tag").$type<"SAFE" | "NORMAL" | "RISKY">(),
  tradingViewLink: text("trading_view_link"),
  notes: text("notes"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  sentAt: timestamp("sent_at"),
});

export const signalReads = pgTable("signal_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  signalId: varchar("signal_id").notNull().references(() => signals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  readAt: timestamp("read_at").default(sql`now()`).notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action").notNull(),
  userId: varchar("user_id").references(() => users.id),
  resourceType: text("resource_type"),
  resourceId: varchar("resource_id"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  createdBy: true,
}).extend({
  takeProfits: z.array(z.object({
    price: z.string().regex(/^\d+\.?\d*$/, "Invalid price format"),
    ratio: z.string().optional(),
  })).min(0).max(5),
  entry: z.string().regex(/^\d+\.?\d*$/, "Invalid entry price format"),
  stopLoss: z.string().regex(/^\d+\.?\d*$/, "Invalid stop loss format"),
});

export const signalValidationSchema = insertSignalSchema.refine((data) => {
  const entry = parseFloat(data.entry);
  const stopLoss = parseFloat(data.stopLoss);
  
  if (entry === stopLoss) {
    return false;
  }
  
  // Validate take profits based on signal direction
  const isLong = data.side === "BUY" || data.side === "BUY_LIMIT";
  
  for (const tp of data.takeProfits) {
    const tpPrice = parseFloat(tp.price);
    
    if (isLong) {
      // Long: SL < Entry, TPs > Entry
      if (stopLoss >= entry || tpPrice <= entry) {
        return false;
      }
    } else {
      // Short: SL > Entry, TPs < Entry  
      if (stopLoss <= entry || tpPrice >= entry) {
        return false;
      }
    }
  }
  
  return true;
}, {
  message: "Invalid price levels for signal direction"
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;
export type SignalRead = typeof signalReads.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
