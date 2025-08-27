import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getFreePicks,
  getPremiumPicks,
  createPick,
  updatePick,
  deletePick,
} from "./routes/picks";
import { getUserRole, updateUserRole, getAllUserRoles } from "./routes/users";
import { checkConnection } from "./db";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/health", async (_req, res) => {
    const dbStatus = await checkConnection();
    res.json({
      status: "ok",
      database: dbStatus.success ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Picks routes
  app.get("/api/picks/free", getFreePicks);
  app.get("/api/picks/premium", getPremiumPicks);
  app.post("/api/picks", createPick);
  app.put("/api/picks/:id", updatePick);
  app.delete("/api/picks/:id", deletePick);

  // User role routes
  app.get("/api/users/:clerkUserId/role", getUserRole);
  app.put("/api/users/:clerkUserId/role", updateUserRole);
  app.get("/api/users/roles", getAllUserRoles);

  return app;
}
