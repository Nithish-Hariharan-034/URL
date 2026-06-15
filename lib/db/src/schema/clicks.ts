import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { shortUrlsTable } from "./short-urls";

export const clicksTable = pgTable("clicks", {
  id: serial("id").primaryKey(),
  shortUrlId: integer("short_url_id").notNull().references(() => shortUrlsTable.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  browser: text("browser"),
  device: text("device"),
  country: text("country"),
});

export const insertClickSchema = createInsertSchema(clicksTable).omit({ id: true, timestamp: true });
export type InsertClick = z.infer<typeof insertClickSchema>;
export type Click = typeof clicksTable.$inferSelect;
