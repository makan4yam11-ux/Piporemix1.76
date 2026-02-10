import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (includes users and sessions tables)
export * from "./models/auth";
import { users } from "./models/auth";

// Re-export chat models
export * from "./models/chat";
import { conversations, messages } from "./models/chat";

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: text("mood"),
  photos: text("photos"),
  voiceNotes: text("voice_notes"),
  tags: text("tags"),
  isVoiceRecorded: boolean("is_voice_recorded").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  fromPipo: boolean("from_pipo").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  emoji: text("emoji"),
  category: text("category"),
  vibeTag: text("vibe_tag"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const taskCustomizations = pgTable("task_customizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskTitle: text("task_title").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  category: text("category").notNull().default("event"),
  color: text("color").notNull().default("#6366f1"),
  icon: text("icon"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isFromPipo: boolean("is_from_pipo").notNull().default(false),
  messageType: text("message_type").notNull().default("text"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const recognizedNames = pgTable("recognized_names", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  relationship: text("relationship"), // friend, family, colleague, etc.
  context: text("context"), // activities/events mentioned with this person
  mentionCount: integer("mention_count").notNull().default(1),
  lastMentioned: timestamp("last_mentioned").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const pendingClarifications = pgTable("pending_clarifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contextType: text("context_type").notNull(), // "reminder", "calendar", "todo"
  partialData: text("partial_data").notNull(), // JSON string with partial information
  waitingFor: text("waiting_for").notNull(), // "time", "date", "priority", etc
  originalMessage: text("original_message").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const starProgress = pgTable("star_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalStars: integer("total_stars").notNull().default(0),
  dailyStars: integer("daily_stars").notNull().default(0),
  lastUpdateDate: text("last_update_date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const starEvents = pgTable("star_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventType: text("event_type").notNull(), // e.g., 'task_completed', 'journal_entry'
  starsEarned: integer("stars_earned").notNull(),
  eventDate: text("event_date").notNull(), // YYYY-MM-DD
  metadata: jsonb("metadata"), // e.g., { taskId: '...' }
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const starMissions = pgTable("star_missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  goalCount: integer("goal_count").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  missionDate: text("mission_date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertStarProgressSchema = createInsertSchema(starProgress).omit({
  id: true,
  createdAt: true,
});

export const insertStarEventSchema = createInsertSchema(starEvents).omit({
  id: true,
  createdAt: true,
});

export const insertStarMissionSchema = createInsertSchema(starMissions).omit({
  id: true,
  createdAt: true,
});

export type StarProgress = typeof starProgress.$inferSelect;
export type StarEvent = typeof starEvents.$inferSelect;
export type StarMission = typeof starMissions.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().optional(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  createdAt: z.string().or(z.date()).optional(),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageDbSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = insertChatMessageDbSchema.extend({
  globalLanguage: z.string().optional(),
});

export const insertRecognizedNameSchema = createInsertSchema(recognizedNames).omit({
  id: true,
  createdAt: true,
  lastMentioned: true,
});

export const insertPendingClarificationSchema = createInsertSchema(pendingClarifications).omit({
  id: true,
  createdAt: true,
});

export const weeklyLogins = pgTable("weekly_logins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStart: timestamp("week_start").notNull(), // Monday of the week
  loginDays: jsonb("login_days").notNull().default([]), // ["2026-01-26", ...]
  rewardsClaimed: jsonb("rewards_claimed").notNull().default({ boost2d: false, coins6d: false }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertWeeklyLoginSchema = createInsertSchema(weeklyLogins).omit({
  id: true,
  createdAt: true,
});

export type WeeklyLogin = typeof weeklyLogins.$inferSelect;
export type InsertWeeklyLogin = z.infer<typeof insertWeeklyLoginSchema>;
export type User = typeof users.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertChatMessageDb = z.infer<typeof insertChatMessageDbSchema>;
export type InsertChatMessageApi = z.infer<typeof insertChatMessageSchema>;
export type InsertChatMessage = InsertChatMessageDb;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertRecognizedName = z.infer<typeof insertRecognizedNameSchema>;
export type RecognizedName = typeof recognizedNames.$inferSelect;
export type InsertPendingClarification = z.infer<typeof insertPendingClarificationSchema>;
export type PendingClarification = typeof pendingClarifications.$inferSelect;
