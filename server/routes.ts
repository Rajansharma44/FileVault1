import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertFileSchema, 
  insertShareLinkSchema 
} from "@shared/schema";
import crypto from "crypto";
import { z } from "zod";
import 'express-session';

// Extend Express session to include userId property
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User Registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      if (req.session) {
        req.session.userId = user.id;
      }
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Google user sync
  app.post("/api/auth/google-sync", async (req: Request, res: Response) => {
    try {
      const { user } = req.body;
      
      if (!user || !user.id || !user.email) {
        return res.status(400).json({ message: "Invalid Google user data" });
      }
      
      // Check if user already exists
      let existingUser = await storage.getUserByEmail(user.email);
      
      if (!existingUser) {
        // Create new user from Google data
        existingUser = await storage.createUser({
          username: user.email.split('@')[0],
          password: crypto.randomBytes(32).toString('hex'), // Random secure password
          name: user.name || '',
          email: user.email,
        });
        console.log("Created new user from Google login:", existingUser.id);
      }
      
      // Log the user in
      if (req.session) {
        req.session.userId = existingUser.id;
      }
      
      const { password, ...userWithoutPassword } = existingUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Google sync error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      
      if (req.session) {
        req.session.userId = user.id;
      }
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: "Error logging out" });
        }
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
  });

  // Get Current User
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Get current user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get User Files
  app.get("/api/files", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const files = await storage.getFilesByUserId(req.session.userId);
      return res.status(200).json(files);
    } catch (error) {
      console.error("Get user files error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload File
  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const fileData = insertFileSchema.parse({
        ...req.body,
        userId: req.session.userId
      });

      const file = await storage.createFile(fileData);
      return res.status(201).json(file);
    } catch (error) {
      console.error("Upload file error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update File
  app.patch("/api/files/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedFile = await storage.updateFile(fileId, req.body);
      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error("Update file error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete File (Move to Trash)
  app.delete("/api/files/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.updateFile(fileId, { isDeleted: true });
      return res.status(200).json({ message: "File moved to trash" });
    } catch (error) {
      console.error("Delete file error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create Share Link
  app.post("/api/files/:id/share", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (file.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const { expiryDays } = req.body;
      let expiryDate: Date | null = null;

      if (expiryDays > 0) {
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
      }

      const token = crypto.randomBytes(16).toString('hex');
      
      const shareLink = await storage.createShareLink({
        token,
        fileId,
        userId: req.session.userId,
        expiryDate: expiryDate || undefined
      });

      return res.status(201).json(shareLink);
    } catch (error) {
      console.error("Create share link error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Shared File by Token
  app.get("/api/share/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const shareLink = await storage.getShareLink(token);

      if (!shareLink) {
        return res.status(404).json({ message: "Invalid or expired share link" });
      }

      // Check if the link is expired
      if (shareLink.expiryDate && new Date(shareLink.expiryDate) < new Date()) {
        return res.status(410).json({ message: "Share link has expired" });
      }

      const file = await storage.getFile(shareLink.fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      return res.status(200).json(file);
    } catch (error) {
      console.error("Get shared file error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
