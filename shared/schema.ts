import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username"),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email").notNull().unique(),
  isGoogleUser: boolean("is_google_user").default(false),
  isVerified: boolean("is_verified").default(false),
  photoURL: text("photo_url").default(null),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  isGoogleUser: true,
  isVerified: true,
  photoURL: true,
}).extend({
  email: z.string().email(),
  username: z.string().optional(),
  password: z.string().min(6),
  name: z.string().optional(),
  isGoogleUser: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false),
  photoURL: z.string().optional().nullable(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  content: text("content").notNull(), // Base64 encoded file content
  userId: integer("user_id").notNull(),
  folder: text("folder").default(""),
  dateAdded: timestamp("date_added").defaultNow(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
  isShared: boolean("is_shared").default(false),
  isStarred: boolean("is_starred").default(false),
  isFolder: boolean("is_folder").default(false),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  type: true,
  size: true,
  content: true,
  userId: true,
  folder: true,
  lastAccessed: true,
}).extend({
  folder: z.string().optional().default(""),
  isFolder: z.boolean().optional().default(false),
});

export const shareLinks = pgTable("share_links", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  fileId: integer("file_id").notNull(),
  userId: integer("user_id").notNull(),
  expiryDate: timestamp("expiry_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShareLinkSchema = createInsertSchema(shareLinks).pick({
  token: true,
  fileId: true,
  userId: true,
  expiryDate: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
export type InsertShareLink = z.infer<typeof insertShareLinkSchema>;
export type ShareLink = typeof shareLinks.$inferSelect;
