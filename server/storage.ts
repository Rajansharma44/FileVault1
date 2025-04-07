import { 
  users, type User, type InsertUser, 
  files, type File, type InsertFile,
  shareLinks, type ShareLink, type InsertShareLink
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File methods
  getFile(id: number): Promise<File | undefined>;
  getFilesByUserId(userId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  
  // Share Link methods
  createShareLink(shareLink: InsertShareLink): Promise<ShareLink>;
  getShareLink(token: string): Promise<ShareLink | undefined>;
  deleteShareLink(id: number): Promise<boolean>;
  getShareLinksByFileId(fileId: number): Promise<ShareLink[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private shareLinks: Map<number, ShareLink>;
  private userIdCounter: number;
  private fileIdCounter: number;
  private shareLinkIdCounter: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.shareLinks = new Map();
    this.userIdCounter = 1;
    this.fileIdCounter = 1;
    this.shareLinkIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // File methods
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByUserId(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const file: File = { 
      ...insertFile, 
      id, 
      dateAdded: new Date(), 
      isDeleted: false,
      isShared: false
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const file = this.files.get(id);
    if (!file) return false;

    // Soft delete by setting isDeleted flag
    const updatedFile = { ...file, isDeleted: true };
    this.files.set(id, updatedFile);
    return true;
  }

  // Share Link methods
  async createShareLink(insertShareLink: InsertShareLink): Promise<ShareLink> {
    const id = this.shareLinkIdCounter++;
    const shareLink: ShareLink = { 
      ...insertShareLink, 
      id, 
      createdAt: new Date() 
    };
    this.shareLinks.set(id, shareLink);

    // Update file to mark as shared
    const file = this.files.get(insertShareLink.fileId);
    if (file) {
      const updatedFile = { ...file, isShared: true };
      this.files.set(file.id, updatedFile);
    }

    return shareLink;
  }

  async getShareLink(token: string): Promise<ShareLink | undefined> {
    return Array.from(this.shareLinks.values()).find(
      (shareLink) => shareLink.token === token
    );
  }

  async deleteShareLink(id: number): Promise<boolean> {
    return this.shareLinks.delete(id);
  }

  async getShareLinksByFileId(fileId: number): Promise<ShareLink[]> {
    return Array.from(this.shareLinks.values()).filter(
      (shareLink) => shareLink.fileId === fileId
    );
  }
}

export const storage = new MemStorage();
