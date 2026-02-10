import { Express } from "express";
import { storage } from "../storage";

export function registerStarRoutes(app: Express) {
  // Get star progress
  app.get("/api/stars/progress", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const progress = await storage.getStarProgress(user.id);
    res.json(progress || { totalStars: 0, dailyStars: 0 });
  });

  // Get star events for history
  app.get("/api/stars/events", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const events = await storage.getStarEvents(user.id);
    res.json(events);
  });

  // Get daily missions
  app.get("/api/stars/missions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const missions = await storage.getDailyMissions(user.id);
    res.json(missions);
  });

  // Internal trigger (could be simplified with middleware later)
  app.post("/api/stars/trigger", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    const { eventType, amount = 1, metadata } = req.body;
    
    const result = await storage.addStars(user.id, amount, eventType, metadata);
    res.json(result);
  });
}
