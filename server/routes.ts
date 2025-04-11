import express, { Request, Response } from 'express';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// JWT secret key from environment variable or fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include session
interface AuthenticatedRequest extends Request {
  session?: {
    userId: number;
  };
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader); // Debug log

  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token:', token); // Debug log

  if (!token) {
    console.log('No token provided'); // Debug log
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('Token verification error:', err); // Debug log
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Token verified successfully:', user); // Debug log
    req.session = { userId: user.id };
    next();
  });
};

// Function to register all routes
export function registerRoutes(app: express.Application) {
  // Registration endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Check if username already exists (if provided)
      if (userData.username) {
        const existingUsername = await storage.getUserByUsername(userData.username);
        if (existingUsername) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user with isVerified set to true
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        isVerified: true
      });

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // For regular users, verify password
      if (!user.isGoogleUser) {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      // In a real application, you might want to invalidate the token on the server
      // For now, we'll just return a success message
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Protected route example
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        photoURL: user.photoURL
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update profile endpoint
  app.patch("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const updateFields = req.body as {
        name?: string;
        username?: string;
        photoURL?: string;
      };

      // Get current user
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Validate the update data
      const updateData = {
        name: updateFields.name || currentUser.name || null,
        username: updateFields.username || currentUser.username || null,
        photoURL: updateFields.photoURL || currentUser.photoURL || null
      };

      // If username is being changed, check if it's already taken
      if (updateFields.username && updateFields.username !== currentUser.username) {
        const existingUser = await storage.getUserByUsername(updateFields.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      // Update user
      const updatedUser = await storage.updateUser(userId, updateData);

      // Return only necessary user data
      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        photoURL: updatedUser.photoURL
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get files endpoint (including deleted files if requested)
  app.get("/api/files", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const includeDeleted = req.query.includeDeleted === 'true';

      const files = await storage.getFilesByUserId(userId, includeDeleted);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  // Get deleted files endpoint
  app.get("/api/files/trash", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const deletedFiles = await storage.getDeletedFiles(userId);
      res.json(deletedFiles);
    } catch (error) {
      console.error("Error fetching deleted files:", error);
      res.status(500).json({ error: "Failed to fetch deleted files" });
    }
  });

  app.post("/api/files", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const fileData = {
        ...req.body,
        userId,
      };
      const file = await storage.createFile(fileData);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ error: "Failed to create file" });
    }
  });

  app.patch("/api/files/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;
      
      // Check if file exists and belongs to user
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: "File not found" });
      }
      if (existingFile.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedFile = await storage.updateFile(fileId, req.body);
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Failed to update file" });
    }
  });

  // Delete file endpoint (moves to trash)
  app.delete("/api/files/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const success = await storage.deleteFile(fileId);
      
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json({ message: "File moved to trash" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Permanently delete file endpoint
  app.delete("/api/files/:id/permanent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const success = await storage.permanentlyDeleteFile(fileId);
      
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json({ message: "File permanently deleted" });
    } catch (error) {
      console.error("Error permanently deleting file:", error);
      res.status(500).json({ error: "Failed to permanently delete file" });
    }
  });

  // Restore file from trash
  app.post("/api/files/:id/restore", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const success = await storage.updateFile(fileId, { isDeleted: false });
      
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      
      res.json({ message: "File restored from trash" });
    } catch (error) {
      console.error("Error restoring file:", error);
      res.status(500).json({ error: "Failed to restore file" });
    }
  });

  app.post("/api/files/:id/share", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;
      
      // Check if file exists and belongs to user
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: "File not found" });
      }
      if (existingFile.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { expiryDays } = req.body;
      const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      const shareLink = await storage.createShareLink({
        fileId,
        userId,
        token: Math.random().toString(36).substring(7),
        expiryDate,
      });

      res.json({ link: `${process.env.APP_URL || 'http://localhost:8080'}/shared/${shareLink.token}` });
    } catch (error) {
      console.error("Error sharing file:", error);
      res.status(500).json({ error: "Failed to share file" });
    }
  });

  // Star file endpoint
  app.post("/api/files/:id/star", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;
      
      // Check if file exists and belongs to user
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: "File not found" });
      }
      if (existingFile.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update file to mark as starred
      const updatedFile = await storage.updateFile(fileId, { isStarred: true });
      res.json(updatedFile);
    } catch (error) {
      console.error("Error starring file:", error);
      res.status(500).json({ error: "Failed to star file" });
    }
  });

  // Unstar file endpoint
  app.post("/api/files/:id/unstar", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;
      
      // Check if file exists and belongs to user
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: "File not found" });
      }
      if (existingFile.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update file to mark as unstarred
      const updatedFile = await storage.updateFile(fileId, { isStarred: false });
      res.json(updatedFile);
    } catch (error) {
      console.error("Error unstarring file:", error);
      res.status(500).json({ error: "Failed to unstar file" });
    }
  });

  // Folder endpoints
  app.post("/api/folders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const { name, path } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Valid folder name is required" });
      }

      // Sanitize folder name
      const sanitizedName = name.trim().replace(/[/\\?%*:|"<>]/g, '-');
      
      // Create a virtual folder entry
      const folder = await storage.createFile({
        name: sanitizedName,
        type: 'folder',
        size: 0,
        content: '',
        userId,
        folder: path || '',
        lastAccessed: new Date(),
      });

      // Mark it as a folder
      const folderWithMeta = await storage.updateFile(folder.id, {
        ...folder,
        isFolder: true
      });

      res.status(201).json(folderWithMeta);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ error: "Failed to create folder" });
    }
  });

  // Get folder contents
  app.get("/api/folders/:path(*)", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const folderPath = req.params.path || '';
      
      const files = await storage.getFilesByUserId(userId);
      const folderContents = files.filter(file => {
        if (!folderPath) {
          return !file.folder || file.folder === '';
        }
        return file.folder === folderPath;
      });

      res.json(folderContents);
    } catch (error) {
      console.error("Error fetching folder contents:", error);
      res.status(500).json({ error: "Failed to fetch folder contents" });
    }
  });

  // Delete folder
  app.delete("/api/folders/:path(*)", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const folderPath = req.params.path;

      const files = await storage.getFilesByUserId(userId);
      const folderFiles = files.filter(file => 
        file.folder === folderPath || file.folder?.startsWith(folderPath + '/')
      );

      // Move all files in the folder to trash
      for (const file of folderFiles) {
        await storage.updateFile(file.id, { isDeleted: true });
      }

      res.json({ success: true, message: "Folder moved to trash" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // Get recently accessed files endpoint
  app.get("/api/files/recent", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.session!.userId;
      const files = await storage.getFilesByUserId(userId, false);
      
      // Sort by lastAccessed date and get the 5 most recent
      const recentFiles = files
        .filter(file => file.lastAccessed)
        .sort((a, b) => {
          const dateA = new Date(a.lastAccessed!).getTime();
          const dateB = new Date(b.lastAccessed!).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      
      res.json(recentFiles);
    } catch (error) {
      console.error("Error fetching recent files:", error);
      res.status(500).json({ error: "Failed to fetch recent files" });
    }
  });

  // Update file access time when viewing/downloading
  app.post("/api/files/:id/access", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;
      
      // Check if file exists and belongs to user
      const existingFile = await storage.getFile(fileId);
      if (!existingFile) {
        return res.status(404).json({ error: "File not found" });
      }
      if (existingFile.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update lastAccessed timestamp
      const updatedFile = await storage.updateFile(fileId, { 
        lastAccessed: new Date() 
      });
      
      res.json(updatedFile);
    } catch (error) {
      console.error("Error updating file access:", error);
      res.status(500).json({ error: "Failed to update file access" });
    }
  });

  // Modify the existing file download/view endpoints to update lastAccessed
  app.get("/api/files/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const fileId = parseInt(req.params.id);
      const userId = req.session!.userId;

      const file = await storage.getFile(fileId);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      if (file.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update lastAccessed timestamp
      await storage.updateFile(fileId, { lastAccessed: new Date() });
      
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ error: "Failed to fetch file" });
    }
  });

  // Add other routes here...
}
