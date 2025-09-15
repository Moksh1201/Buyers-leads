import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
});

export const buyers = sqliteTable("buyers", {
	id: text("id").primaryKey(),
	fullName: text("full_name").notNull(),
	email: text("email"),
	phone: text("phone").notNull(),
	city: text("city", { enum: ["Chandigarh","Mohali","Zirakpur","Panchkula","Other"] as const }).notNull(),
	propertyType: text("property_type", { enum: ["Apartment","Villa","Plot","Office","Retail"] as const }).notNull(),
	bhk: text("bhk", { enum: ["1","2","3","4","Studio"] as const }),
	purpose: text("purpose", { enum: ["Buy","Rent"] as const }).notNull(),
	budgetMin: integer("budget_min"),
	budgetMax: integer("budget_max"),
	timeline: text("timeline", { enum: ["0-3m","3-6m",">6m","Exploring"] as const }).notNull(),
	source: text("source", { enum: ["Website","Referral","Walk-in","Call","Other"] as const }).notNull(),
	status: text("status", { enum: ["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"] as const }).notNull().default("New"),
	notes: text("notes"),
	tags: text("tags"), // comma-separated for SQLite simplicity
	ownerId: text("owner_id").notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
});

export const buyerHistory = sqliteTable("buyer_history", {
	id: text("id").primaryKey(),
	buyerId: text("buyer_id").notNull(),
	changedBy: text("changed_by").notNull(),
	changedAt: integer("changed_at", { mode: "timestamp_ms" }).notNull().default(sql`(unixepoch('now') * 1000)`),
	diff: text("diff").notNull(),
});


