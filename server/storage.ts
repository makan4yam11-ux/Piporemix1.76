import { 
  type User, 
  users as usersTable,
  type JournalEntry,
  type InsertJournalEntry,
  type Reminder,
  type InsertReminder,
  type Todo,
  type InsertTodo,
  type CalendarEvent,
  type InsertCalendarEvent,
  type ChatMessage,
  type InsertChatMessage,
  type RecognizedName,
  type InsertRecognizedName,
  type PendingClarification,
  type InsertPendingClarification,
  type WeeklyLogin,
  type InsertWeeklyLogin,
  taskCustomizations as taskCustomizationsTable,
  type StarProgress,
  type StarEvent,
  type StarMission,
  starProgress,
  starEvents,
  starMissions,
  users, journalEntries, reminders, todos, calendarEvents, chatMessages, recognizedNames, pendingClarifications, taskCustomizations, weeklyLogins
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export type TaskCustomization = typeof taskCustomizationsTable.$inferSelect;
export type InsertTaskCustomization = typeof taskCustomizationsTable.$inferInsert;

export type InsertUser = typeof usersTable.$inferInsert;

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getGuestCount(): Promise<number>;
  clearGuestData(userId: string): Promise<void>;

  // Journal operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  deleteJournalEntry(id: string): Promise<void>;

  // Reminder operations  
  getReminders(userId: string): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<void>;

  // Todo operations
  getTodos(userId: string): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined>;
  deleteTodo(id: string): Promise<void>;

  // Task Customization Emoji Memory
  getTaskCustomizations(userId: string): Promise<TaskCustomization[]>;
  upsertTaskCustomization(userId: string, taskTitle: string, emoji: string): Promise<TaskCustomization>;

  // Calendar operations
  getCalendarEvents(userId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Chat operations
  getChatMessages(userId: string): Promise<ChatMessage[]>;
  getChatMessagesByDate(userId: string, date: Date): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Recognized names operations
  getRecognizedNames(userId: string): Promise<RecognizedName[]>;
  getRecognizedNameByName(userId: string, name: string): Promise<RecognizedName | undefined>;
  createRecognizedName(recognizedName: InsertRecognizedName): Promise<RecognizedName>;
  updateRecognizedName(id: string, updates: Partial<RecognizedName>): Promise<RecognizedName | undefined>;

  // Pending clarifications operations
  getPendingClarification(userId: string): Promise<PendingClarification | undefined>;
  createPendingClarification(clarification: InsertPendingClarification): Promise<PendingClarification>;
  deletePendingClarification(id: string): Promise<void>;
  clearUserPendingClarifications(userId: string): Promise<void>;

  // Star operations
  getStarProgress(userId: string): Promise<StarProgress | undefined>;
  getStarEvents(userId: string, date?: string): Promise<StarEvent[]>;
  addStars(userId: string, amount: number, eventType: string, metadata?: any): Promise<{ success: boolean; starsAdded: number; totalStars: number }>;
  getDailyMissions(userId: string): Promise<StarMission[]>;
  updateMissionProgress(userId: string, eventType: string): Promise<void>;

  // Weekly login operations
  getWeeklyLogin(userId: string, weekStart: Date): Promise<WeeklyLogin | undefined>;
  createWeeklyLogin(progress: InsertWeeklyLogin): Promise<WeeklyLogin>;
  updateWeeklyLogin(id: string, updates: Partial<WeeklyLogin>): Promise<WeeklyLogin | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getGuestCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.username} LIKE 'pipo_guest_%'`);
    return Number(result.count);
  }

  async createUser(insertUser: any): Promise<User> {
    const id = insertUser.id || randomUUID();
    // Default name and email if not provided to satisfy potential schema constraints
    const name = insertUser.name || insertUser.nickname || insertUser.username;
    const email = insertUser.email || `${insertUser.username}@example.com`;
    // Ensure all required fields are present and password is provided
    const userData = { 
      ...insertUser, 
      id, 
      name, 
      email,
      password: insertUser.password || "guest_password"
    };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries).where(eq(journalEntries.userId, userId));
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const entryData = { ...insertEntry } as any;
    if (entryData.createdAt && typeof entryData.createdAt === 'string') {
      entryData.createdAt = new Date(entryData.createdAt);
    } else if (!entryData.createdAt) {
      delete entryData.createdAt;
    }
    const [entry] = await db.insert(journalEntries).values(entryData).returning();
    return entry;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  }

  async getReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const [reminder] = await db.insert(reminders).values(insertReminder).returning();
    return reminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const [reminder] = await db.update(reminders).set(updates).where(eq(reminders.id, id)).returning();
    return reminder;
  }

  async deleteReminder(id: string): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  async getTodos(userId: string): Promise<Todo[]> {
    return await db.select().from(todos).where(eq(todos.userId, userId));
  }

  // Clear guest data on logout if needed
  async getStarProgress(userId: string): Promise<StarProgress | undefined> {
    const [progress] = await db.select().from(starProgress).where(eq(starProgress.userId, userId));
    return progress;
  }

  async getStarEvents(userId: string, date?: string): Promise<StarEvent[]> {
    if (date) {
      return await db.select().from(starEvents).where(and(eq(starEvents.userId, userId), eq(starEvents.eventDate, date)));
    }
    return await db.select().from(starEvents).where(eq(starEvents.userId, userId));
  }

  async addStars(userId: string, amount: number, eventType: string, metadata?: any): Promise<{ success: boolean; starsAdded: number; totalStars: number }> {
    const today = new Date().toISOString().split('T')[0];
    const SOFT_CAP = 10;

    let progress = await this.getStarProgress(userId);
    if (!progress) {
      const [newProgress] = await db.insert(starProgress).values({
        userId,
        totalStars: 0,
        dailyStars: 0,
        lastUpdateDate: today
      }).returning();
      progress = newProgress;
    }

    // Reset daily cap if it's a new day
    if (progress.lastUpdateDate !== today) {
      progress.dailyStars = 0;
      progress.lastUpdateDate = today;
    }

    if (progress.dailyStars >= SOFT_CAP) {
      return { success: false, starsAdded: 0, totalStars: progress.totalStars };
    }

    const starsToAdd = Math.min(amount, SOFT_CAP - progress.dailyStars);
    if (starsToAdd <= 0) {
      return { success: false, starsAdded: 0, totalStars: progress.totalStars };
    }

    // Update progress
    const [updatedProgress] = await db.update(starProgress)
      .set({
        totalStars: progress.totalStars + starsToAdd,
        dailyStars: progress.dailyStars + starsToAdd,
        lastUpdateDate: today
      })
      .where(eq(starProgress.id, progress.id))
      .returning();

    // Log event
    await db.insert(starEvents).values({
      userId,
      eventType,
      starsEarned: starsToAdd,
      eventDate: today,
      metadata
    });

    // Update mission progress
    await this.updateMissionProgress(userId, eventType);

    return { success: true, starsAdded: starsToAdd, totalStars: updatedProgress.totalStars };
  }

  async getDailyMissions(userId: string): Promise<StarMission[]> {
    const today = new Date().toISOString().split('T')[0];
    const missions = await db.select().from(starMissions).where(and(eq(starMissions.userId, userId), eq(starMissions.missionDate, today)));
    
    if (missions.length === 0) {
      // Create default missions for today
      const defaultMissions = [
        { title: "Complete a task", goalCount: 1, eventType: "task_completed" },
        { title: "Write in journal", goalCount: 1, eventType: "journal_entry_created" },
        { title: "Check your mood", goalCount: 1, eventType: "mood_check_completed" }
      ];

      const createdMissions = await Promise.all(defaultMissions.map(m => 
        db.insert(starMissions).values({
          userId,
          title: m.title,
          goalCount: m.goalCount,
          missionDate: today,
          currentCount: 0,
          isCompleted: false
        }).returning()
      ));
      return createdMissions.map(m => m[0]);
    }
    return missions;
  }

  async updateMissionProgress(userId: string, eventType: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const missions = await this.getDailyMissions(userId);
    
    for (const mission of missions) {
      // Simple mapping for now
      let shouldUpdate = false;
      if (mission.title.toLowerCase().includes("task") && eventType === "task_completed") shouldUpdate = true;
      if (mission.title.toLowerCase().includes("journal") && eventType === "journal_entry_created") shouldUpdate = true;
      if (mission.title.toLowerCase().includes("mood") && eventType === "mood_check_completed") shouldUpdate = true;

      if (shouldUpdate && !mission.isCompleted) {
        const newCount = mission.currentCount + 1;
        const isCompleted = newCount >= mission.goalCount;
        
        await db.update(starMissions)
          .set({ currentCount: newCount, isCompleted })
          .where(eq(starMissions.id, mission.id));

        if (isCompleted) {
          // Bonus stars for mission completion could be added here
        }
      }
    }
  }

  async clearGuestData(userId: string): Promise<void> {
    if (!userId.startsWith("pipo_guest_")) return;
    
    await Promise.all([
      db.delete(journalEntries).where(eq(journalEntries.userId, userId)),
      db.delete(reminders).where(eq(reminders.userId, userId)),
      db.delete(todos).where(eq(todos.userId, userId)),
      db.delete(calendarEvents).where(eq(calendarEvents.userId, userId)),
      db.delete(chatMessages).where(eq(chatMessages.userId, userId)),
      db.delete(recognizedNames).where(eq(recognizedNames.userId, userId)),
      db.delete(pendingClarifications).where(eq(pendingClarifications.userId, userId)),
      db.delete(weeklyLogins).where(eq(weeklyLogins.userId, userId)),
      db.delete(starProgress).where(eq(starProgress.userId, userId)),
      db.delete(starEvents).where(eq(starEvents.userId, userId)),
      db.delete(users).where(eq(users.id, userId))
    ]);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const [todo] = await db.insert(todos).values(insertTodo).returning();
    return todo;
  }

  async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const [todo] = await db.update(todos).set(updates).where(eq(todos.id, id)).returning();
    return todo;
  }

  async deleteTodo(id: string): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  async getTaskCustomizations(userId: string): Promise<TaskCustomization[]> {
    return await db.select().from(taskCustomizations).where(eq(taskCustomizations.userId, userId));
  }

  async upsertTaskCustomization(userId: string, taskTitle: string, emoji: string): Promise<TaskCustomization> {
    const [existing] = await db.select()
      .from(taskCustomizations)
      .where(and(eq(taskCustomizations.userId, userId), eq(taskCustomizations.taskTitle, taskTitle)));

    if (existing) {
      const [updated] = await db.update(taskCustomizations)
        .set({ emoji })
        .where(eq(taskCustomizations.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(taskCustomizations)
      .values({ userId, taskTitle, emoji })
      .returning();
    return created;
  }

  async getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
  }

  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const [event] = await db.insert(calendarEvents).values(insertEvent).returning();
    return event;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | undefined> {
    const [event] = await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, id)).returning();
    return event;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async getChatMessagesByDate(userId: string, date: Date): Promise<ChatMessage[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.userId, userId),
        sql`${chatMessages.createdAt} >= ${startOfDay}`,
        sql`${chatMessages.createdAt} <= ${endOfDay}`
      ))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getRecognizedNames(userId: string): Promise<RecognizedName[]> {
    return await db.select().from(recognizedNames).where(eq(recognizedNames.userId, userId));
  }

  async getRecognizedNameByName(userId: string, name: string): Promise<RecognizedName | undefined> {
    const [recognizedName] = await db.select()
      .from(recognizedNames)
      .where(and(eq(recognizedNames.userId, userId), eq(recognizedNames.name, name)));
    return recognizedName;
  }

  async createRecognizedName(insertRecognizedName: InsertRecognizedName): Promise<RecognizedName> {
    const [recognizedName] = await db.insert(recognizedNames).values(insertRecognizedName).returning();
    return recognizedName;
  }

  async updateRecognizedName(id: string, updates: Partial<RecognizedName>): Promise<RecognizedName | undefined> {
    const [recognizedName] = await db.update(recognizedNames).set(updates).where(eq(recognizedNames.id, id)).returning();
    return recognizedName;
  }

  async getPendingClarification(userId: string): Promise<PendingClarification | undefined> {
    const [clarification] = await db.select()
      .from(pendingClarifications)
      .where(eq(pendingClarifications.userId, userId));
    return clarification;
  }

  async createPendingClarification(insertClarification: InsertPendingClarification): Promise<PendingClarification> {
    await this.clearUserPendingClarifications(insertClarification.userId);
    const [clarification] = await db.insert(pendingClarifications).values(insertClarification).returning();
    return clarification;
  }

  async deletePendingClarification(id: string): Promise<void> {
    await db.delete(pendingClarifications).where(eq(pendingClarifications.id, id));
  }

  async clearUserPendingClarifications(userId: string): Promise<void> {
    await db.delete(pendingClarifications).where(eq(pendingClarifications.userId, userId));
  }

  async getWeeklyLogin(userId: string, weekStart: Date): Promise<WeeklyLogin | undefined> {
    const [progress] = await db.select()
      .from(weeklyLogins)
      .where(and(eq(weeklyLogins.userId, userId), eq(weeklyLogins.weekStart, weekStart)));
    return progress;
  }

  async createWeeklyLogin(insertProgress: InsertWeeklyLogin): Promise<WeeklyLogin> {
    const [progress] = await db.insert(weeklyLogins).values(insertProgress).returning();
    return progress;
  }

  async updateWeeklyLogin(id: string, updates: Partial<WeeklyLogin>): Promise<WeeklyLogin | undefined> {
    const [progress] = await db.update(weeklyLogins).set(updates).where(eq(weeklyLogins.id, id)).returning();
    return progress;
  }
}

export const storage = new DatabaseStorage();
