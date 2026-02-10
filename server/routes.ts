import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertChatMessageDbSchema, insertReminderSchema, insertTodoSchema, insertCalendarEventSchema, insertJournalEntrySchema } from "@shared/schema";
import { parseIndonesianTime, createJakartaDate } from "./IndonesianTemporalInterpreter";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import { stripeService } from "./stripeService";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import { db } from "./db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: "replit",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerStarRoutes } from "./replit_integrations/star_system";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup authentication FIRST (MUST be before any auth routes)
  await setupAuth(app);
  registerAuthRoutes(app);

  // Wire up Replit AI Integrations
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);
  registerStarRoutes(app);

  // Password-based signup/login routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, nickname } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        username,
        password, // In a real app, hash this!
        nickname: nickname || username,
        setupComplete: true
      });
      req.login(user, (err) => {
        if (err) {
          console.error("req.login after register error:", err);
          return res.status(500).json({ message: "Login after signup failed" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Registration catch error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Username does not exist" });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ message: "Password is incorrect" });
      }

      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Login error" });
    }
  });

  app.post("/api/auth/guest", async (req, res) => {
    try {
      // Ensure ip is a string and handle potential array from x-forwarded-for
      const ipRaw = req.ip || req.headers['x-forwarded-for'] || "unknown";
      const ipStr = Array.isArray(ipRaw) ? ipRaw[0] : (typeof ipRaw === 'string' ? ipRaw : 'unknown');
      const guestUsername = `pipo_guest_${ipStr.replace(/[:.]/g, '_')}`;
      
      let guestUser = await storage.getUserByUsername(guestUsername);
      if (!guestUser) {
        const guestNumber = (await storage.getGuestCount()) + 1;
        
        guestUser = await storage.createUser({
          username: guestUsername,
          password: "guest_password", // Added default password
          nickname: `Guest#${guestNumber}`,
          setupComplete: true,
          name: `Guest User ${guestNumber}`,
          email: `${guestUsername}@pipo.app`
        });
      }
      
      req.login(guestUser, (err) => {
        if (err) {
          console.error("req.login error:", err);
          return res.status(500).json({ message: "Guest login failed" });
        }
        res.json(guestUser);
      });
    } catch (error) {
      console.error("Guest login catch error:", error);
      res.status(500).json({ message: "Guest setup failed" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    const user = req.user as any;
    const userId = user?.id;

    req.logout(async (err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      
      if (userId) {
        try {
          await storage.clearGuestData(userId);
        } catch (error) {
          console.error("Error clearing guest data on logout:", error);
        }
      }
      
      res.json({ success: true });
    });
  });

  app.get("/api/user/check-username", async (req, res) => {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Username is required" });
    }
    const user = await storage.getUserByUsername(username);
    res.json({ available: !user });
  });

  app.post("/api/user/setup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = req.user as any;
    const { username, nickname } = req.body;

    if (!username || !nickname) {
      return res.status(400).json({ message: "Username and nickname are required" });
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser && existingUser.id !== user.id) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const updatedUser = await storage.updateUser(user.id, {
      username,
      nickname,
      setupComplete: true
    });

    res.json(updatedUser);
  });

  // Profile picture upload configuration
  const profilePictureStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads", "profile-pictures");
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const userId = (req.user as any)?.id || "unknown";
      const ext = path.extname(file.originalname);
      cb(null, `${userId}-${Date.now()}${ext}`);
    }
  });

  const profileUpload = multer({
    storage: profilePictureStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
      }
    }
  });

  // Upload profile picture
  app.post("/api/user/profile-picture", profileUpload.single("profilePicture"), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req.user as any).id;
      const profileImageUrl = `/uploads/profile-pictures/${req.file.filename}`;
      console.log('Profile picture uploaded successfully:', profileImageUrl);

      const updatedUser = await storage.updateUser(userId, {
        profileImageUrl
      });

      if (!updatedUser) {
        console.error('Failed to update user in database after upload');
        return res.status(500).json({ message: "Failed to update user profile" });
      }

      res.json({ success: true, profileImageUrl, user: updatedUser });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Get current user
  app.get("/api/user/current", async (req, res) => {
    try {
      if (req.isAuthenticated()) {
        const user = req.user as any;
        const dbUser = await storage.getUser(user.id);
        if (dbUser) return res.json(dbUser);
      }
      res.status(401).json({ message: "Not logged in" });
    } catch (error) {
      console.error('Error in GET /api/user/current:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get chat messages with date filtering
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { date } = req.query;
      let messages;
      
      if (date && typeof date === 'string') {
        const filterDate = new Date(date);
        messages = await storage.getChatMessagesByDate((req.user as any)?.id || "default-user", filterDate);
      } else {
        messages = await storage.getChatMessages((req.user as any)?.id || "default-user");
      }
      
      res.json(messages);
    } catch (error) {
      console.error('Error in GET /api/chat/messages:', error);
      res.status(500).json({ message: "Failed to get chat messages" });
    }
  });

  // Send chat message
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const messageData = insertChatMessageDbSchema.parse({
        ...req.body,
        userId: authUserId,
      });
      
      const chatMessage = await storage.createChatMessage(messageData);
      res.json(chatMessage);
    } catch (error) {
      console.error('Error in POST /api/chat/messages:', error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Parse Indonesian time expression for calendar
  app.post("/api/parse-time", async (req, res) => {
    try {
      const { timeExpression, referenceDate } = req.body;
      
      if (!timeExpression) {
        return res.status(400).json({ message: "timeExpression is required" });
      }

      const reference = referenceDate ? new Date(referenceDate) : new Date();
      const parseResult = parseIndonesianTime(timeExpression, reference);
      
      res.json(parseResult);
    } catch (error) {
      console.error('Error in POST /api/parse-time:', error);
      res.status(500).json({ message: "Failed to parse time expression" });
    }
  });

  // Get weekly login progress
  app.get("/api/user/weekly-progress", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      let progress = await storage.getWeeklyLogin(authUserId, startOfWeek);
      if (!progress) {
        progress = await storage.createWeeklyLogin({
          userId: authUserId,
          weekStart: startOfWeek,
          loginDays: [],
          rewardsClaimed: { boost2d: false, coins6d: false }
        });
      }

      // Automatically record login for today if not already recorded
      const todayStr = now.toISOString().split('T')[0];
      const loginDays = (progress.loginDays as string[]) || [];
      if (!loginDays.includes(todayStr)) {
        const updatedDays = [...loginDays, todayStr];
        progress = await storage.updateWeeklyLogin(progress.id, { loginDays: updatedDays });
      }

      res.json(progress);
    } catch (error) {
      console.error('Error in GET /api/user/weekly-progress:', error);
      res.status(500).json({ message: "Failed to get progress" });
    }
  });

  // Claim reward
  app.post("/api/user/claim-reward", async (req, res) => {
    try {
      const { rewardType } = req.body;
      const authUserId = (req.user as any)?.id || "default-user";
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const progress = await storage.getWeeklyLogin(authUserId, startOfWeek);
      if (!progress) return res.status(404).json({ message: "Progress not found" });

      const updatedRewards = { ...(progress.rewardsClaimed as any) };
      if (rewardType === 'boost2d') updatedRewards.boost2d = true;
      if (rewardType === 'coins6d') updatedRewards.coins6d = true;

      const updated = await storage.updateWeeklyLogin(progress.id, { rewardsClaimed: updatedRewards });
      res.json(updated);
    } catch (error) {
      console.error('Error in POST /api/user/claim-reward:', error);
      res.status(500).json({ message: "Failed to claim reward" });
    }
  });

  // Get journal entries
  app.get("/api/journal/entries", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const entries = await storage.getJournalEntries(authUserId);
      res.json(entries);
    } catch (error) {
      console.error('Error in GET /api/journal/entries:', error);
      res.status(500).json({ message: "Failed to get journal entries" });
    }
  });

  // Create journal entry
  app.post("/api/journal/entries", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse({
        ...req.body,
        userId: (req.user as any)?.id || "default-user",
      });

      const entry = await storage.createJournalEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error('Error in POST /api/journal/entries:', error);
      res.status(400).json({ message: "Failed to create journal entry" });
    }
  });

  // Delete journal entry
  app.delete("/api/journal/entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteJournalEntry(id);
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      console.error('Error in DELETE /api/journal/entries/:id:', error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Get reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const reminders = await storage.getReminders(authUserId);
      res.json(reminders);
    } catch (error) {
      console.error('Error in GET /api/reminders:', error);
      res.status(500).json({ message: "Failed to get reminders" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const data = { ...req.body };
      if (typeof data.dueDate === 'string') {
        data.dueDate = new Date(data.dueDate);
      }
      
      const validatedData = insertReminderSchema.parse({
        ...data,
        userId: (req.user as any)?.id || "default-user",
      });

      const reminder = await storage.createReminder(validatedData);
      res.json(reminder);
    } catch (error) {
      console.error('Error in POST /api/reminders:', error);
      res.status(400).json({ message: "Failed to create reminder" });
    }
  });

  // Update reminder
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const reminder = await storage.updateReminder(id, req.body);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      res.json(reminder);
    } catch (error) {
      console.error('Error in PATCH /api/reminders/:id:', error);
      res.status(400).json({ message: "Failed to update reminder" });
    }
  });

  // Delete reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReminder(id);
      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      console.error('Error in DELETE /api/reminders/:id:', error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });

  // Get todos
  app.get("/api/todos", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const todos = await storage.getTodos(authUserId);
      res.json(todos);
    } catch (error) {
      console.error('Error in GET /api/todos:', error);
      res.status(500).json({ message: "Failed to get todos" });
    }
  });

  // Create todo
  app.post("/api/todos", async (req, res) => {
    try {
      const validatedData = insertTodoSchema.parse({
        ...req.body,
        userId: (req.user as any)?.id || "default-user",
      });

      const todo = await storage.createTodo(validatedData);
      res.json(todo);
    } catch (error) {
      console.error('Error in POST /api/todos:', error);
      res.status(400).json({ message: "Failed to create todo" });
    }
  });

  // Update todo
  app.patch("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.updateTodo(id, req.body);
      
      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }
      
      res.json(todo);
    } catch (error) {
      console.error('Error in PATCH /api/todos/:id:', error);
      res.status(400).json({ message: "Failed to update todo" });
    }
  });

  // Delete todo
  app.delete("/api/todos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTodo(id);
      res.json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error('Error in DELETE /api/todos/:id:', error);
      res.status(500).json({ message: "Failed to delete todo" });
    }
  });

  // Get calendar events
  app.get("/api/calendar/events", async (req, res) => {
    try {
      const authUserId = (req.user as any)?.id || "default-user";
      const events = await storage.getCalendarEvents(authUserId);
      res.json(events);
    } catch (error) {
      console.error('Error in GET /api/calendar/events:', error);
      res.status(500).json({ message: "Failed to get calendar events" });
    }
  });

  // Create calendar event
  app.post("/api/calendar/events", async (req, res) => {
    try {
      const startTimeStr = req.body.startTime;
      const endTimeStr = req.body.endTime;
      
      const startTimeParts = startTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      const endTimeParts = endTimeStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      
      if (!startTimeParts || !endTimeParts) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const startDate = `${startTimeParts[1]}-${startTimeParts[2]}-${startTimeParts[3]}`;
      const startTime = `${startTimeParts[4]}:${startTimeParts[5]}`;
      const endDate = `${endTimeParts[1]}-${endTimeParts[2]}-${endTimeParts[3]}`;
      const endTime = `${endTimeParts[4]}:${endTimeParts[5]}`;
      
      const validatedData = insertCalendarEventSchema.parse({
        ...req.body,
        userId: "default-user",
        startTime: createJakartaDate(startDate, startTime),
        endTime: createJakartaDate(endDate, endTime),
      });

      const event = await storage.createCalendarEvent(validatedData);
      res.json(event);
    } catch (error) {
      console.error('Error in POST /api/calendar/events:', error);
      res.status(400).json({ message: "Failed to create calendar event" });
    }
  });

  // Update calendar event
  app.patch("/api/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = { ...req.body };
      
      if (updates.startTime) {
        const startTimeParts = updates.startTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (startTimeParts) {
          const startDate = `${startTimeParts[1]}-${startTimeParts[2]}-${startTimeParts[3]}`;
          const startTime = `${startTimeParts[4]}:${startTimeParts[5]}`;
          updates.startTime = createJakartaDate(startDate, startTime);
        } else {
          updates.startTime = new Date(updates.startTime);
        }
      }
      if (updates.endTime) {
        const endTimeParts = updates.endTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
        if (endTimeParts) {
          const endDate = `${endTimeParts[1]}-${endTimeParts[2]}-${endTimeParts[3]}`;
          const endTime = `${endTimeParts[4]}:${endTimeParts[5]}`;
          updates.endTime = createJakartaDate(endDate, endTime);
        } else {
          updates.endTime = new Date(updates.endTime);
        }
      }
      
      const event = await storage.updateCalendarEvent(id, updates);
      
      if (!event) {
        return res.status(404).json({ message: "Calendar event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Error in PATCH /api/calendar/events/:id:', error);
      res.status(400).json({ message: "Failed to update calendar event" });
    }
  });

  // Delete calendar event
  app.delete("/api/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCalendarEvent(id);
      res.json({ message: "Calendar event deleted successfully" });
    } catch (error) {
      console.error('Error in DELETE /api/calendar/events/:id:', error);
      res.status(500).json({ message: "Failed to delete calendar event" });
    }
  });

  // Get task customizations (emoji memory)
  app.get("/api/todos/customizations", async (req, res) => {
    try {
      const customizations = await storage.getTaskCustomizations("default-user");
      res.json(customizations);
    } catch (error) {
      console.error('Error in GET /api/todos/customizations:', error);
      res.status(500).json({ message: "Failed to get customizations" });
    }
  });

  // Save task customization
  app.post("/api/todos/customizations", async (req, res) => {
    try {
      const { taskTitle, emoji } = req.body;
      const customization = await storage.upsertTaskCustomization("default-user", taskTitle, emoji);
      res.json(customization);
    } catch (error) {
      console.error('Error in POST /api/todos/customizations:', error);
      res.status(500).json({ message: "Failed to save customization" });
    }
  });

  async function extractAndTrackNames(text: string, userId: string) {
    const namePattern = /(?:halo|nama saya|panggil aku|sama)\s+([A-Z][a-z]+)/g;
    let match;
    while ((match = namePattern.exec(text)) !== null) {
      const name = match[1];
      const existing = await storage.getRecognizedNameByName(userId, name);
      if (existing) {
        await storage.updateRecognizedName(existing.id, {
          mentionCount: existing.mentionCount + 1,
          lastMentioned: new Date()
        });
      } else {
        await storage.createRecognizedName({
          userId,
          name,
          relationship: "friend",
          mentionCount: 1
        });
      }
    }
  }

  return httpServer;
}
