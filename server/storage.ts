import { 
  users, type User, type InsertUser, 
  files, type File, type InsertFile,
  shareLinks, type ShareLink, type InsertShareLink
} from "@shared/schema";
import fs from 'fs';
import path from 'path';

// Define the data structure for our JSON storage
interface StorageData {
  users: User[];
  files: File[];
  shareLinks: ShareLink[];
  userIdCounter: number;
  fileIdCounter: number;
  shareLinkIdCounter: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: { name?: string | null; username?: string | null; photoURL?: string | null }): Promise<User>;
  
  // File methods
  getFile(id: number): Promise<File | undefined>;
  getFilesByUserId(userId: number, includeDeleted?: boolean): Promise<File[]>;
  getDeletedFiles(userId: number): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  permanentlyDeleteFile(id: number): Promise<boolean>;
  
  // Share Link methods
  createShareLink(shareLink: InsertShareLink): Promise<ShareLink>;
  getShareLink(token: string): Promise<ShareLink | undefined>;
  deleteShareLink(id: number): Promise<boolean>;
  getShareLinksByFileId(fileId: number): Promise<ShareLink[]>;
}

// In-memory storage implementation (non-persistent)
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
    const user: User = {
      id,
      username: insertUser.username ?? null,
      name: insertUser.name ?? null,
      password: insertUser.password,
      email: insertUser.email,
      isGoogleUser: insertUser.isGoogleUser ?? false,
      isVerified: insertUser.isVerified ?? false,
      photoURL: insertUser.photoURL ?? null
    };
    this.users.set(id, user);

    // Add sample files for the new user
    this.addSampleFiles(id);

    return user;
  }

  async updateUser(id: number, updates: { name?: string | null; username?: string | null; photoURL?: string | null }): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...user,
      name: updates.name ?? user.name,
      username: updates.username ?? user.username,
      photoURL: updates.photoURL ?? user.photoURL
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // File methods
  private addSampleFiles(userId: number) {
    const sampleFiles = [
      {
        name: 'Welcome.txt',
        type: 'text/plain',
        size: 1024,
        content: 'Welcome to FileVault!',
        userId,
        folder: '',
        dateAdded: new Date(),
        lastAccessed: new Date(),
        isDeleted: false,
        isShared: false,
        isStarred: false
      },
      {
        name: 'Getting Started.txt',
        type: 'text/plain',
        size: 2048,
        content: 'This is a sample file to help you get started with FileVault.',
        userId,
        folder: '',
        dateAdded: new Date(),
        lastAccessed: new Date(),
        isDeleted: false,
        isShared: false,
        isStarred: false
      }
    ];

    sampleFiles.forEach(file => {
      const id = this.fileIdCounter++;
      this.files.set(id, { ...file, id });
    });
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByUserId(userId: number, includeDeleted: boolean = false): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId && (includeDeleted || !file.isDeleted)
    );
  }

  async getDeletedFiles(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.userId === userId && file.isDeleted
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.fileIdCounter++;
    const now = new Date();
    const file: File = { 
      id,
      name: insertFile.name,
      type: insertFile.type,
      size: insertFile.size,
      content: insertFile.content,
      userId: insertFile.userId,
      folder: insertFile.folder || "",
      dateAdded: now ?? null,
      lastAccessed: insertFile.lastAccessed ?? now ?? null,
      isDeleted: false,
      isShared: false,
      isStarred: false,
      isFolder: insertFile.isFolder || false,
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

    const updatedFile = { ...file, isDeleted: true };
    this.files.set(id, updatedFile);
    return true;
  }

  async permanentlyDeleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  // Share Link methods
  async createShareLink(insertShareLink: InsertShareLink): Promise<ShareLink> {
    const id = this.shareLinkIdCounter++;
    const shareLink: ShareLink = { 
      id,
      ...insertShareLink, 
      createdAt: new Date(),
      expiryDate: insertShareLink.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    };
    this.shareLinks.set(id, shareLink);
    return shareLink;
  }

  async getShareLink(token: string): Promise<ShareLink | undefined> {
    return Array.from(this.shareLinks.values()).find(
      (link) => link.token === token
    );
  }

  async deleteShareLink(id: number): Promise<boolean> {
    return this.shareLinks.delete(id);
  }

  async getShareLinksByFileId(fileId: number): Promise<ShareLink[]> {
    return Array.from(this.shareLinks.values()).filter(
      (link) => link.fileId === fileId
    );
  }
}

// File-based storage implementation (persistent)
export class FileStorage implements IStorage {
  private data: StorageData = {
    users: [],
    files: [],
    shareLinks: [],
    userIdCounter: 1,
    fileIdCounter: 1,
    shareLinkIdCounter: 1
  };
  private dataFilePath: string;

  constructor() {
    // Create a data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dataFilePath = path.join(dataDir, 'storage.json');
    
    // Initialize or load data
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
        this.data = JSON.parse(fileContent);
        console.log('Loaded data from file storage');
      } catch (error) {
        console.error('Error loading data from file:', error);
        this.initializeEmptyData();
      }
    } else {
      this.initializeEmptyData();
      this.saveData();
    }
  }

  private initializeEmptyData(): void {
    this.data = {
      users: [],
      files: [],
      shareLinks: [],
      userIdCounter: 1,
      fileIdCounter: 1,
      shareLinkIdCounter: 1
    };
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2));
      console.log('Data saved to file storage');
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.data.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.data.users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.data.userIdCounter++;
    const user: User = {
      id,
      username: insertUser.username ?? null,
      name: insertUser.name ?? null,
      password: insertUser.password,
      email: insertUser.email,
      isGoogleUser: insertUser.isGoogleUser ?? false,
      isVerified: insertUser.isVerified ?? false,
      photoURL: insertUser.photoURL ?? null
    };
    this.data.users.push(user);
    this.saveData();

    // Add sample files for the new user
    await this.addSampleFiles(id);

    return user;
  }

  // File methods
  async addSampleFiles(userId: number): Promise<void> {
    const now = new Date();
    const welcomeFile: File = {
      id: this.data.fileIdCounter++,
      name: "Welcome.txt",
      type: "text/plain",
      size: 1024,
      content: "Welcome to FileVault! This is a sample file to help you get started.",
      userId,
      folder: "",
      dateAdded: now,
      lastAccessed: now,
      isDeleted: false,
      isShared: false,
      isStarred: false,
      isFolder: false
    };

    const gettingStartedFile: File = {
      id: this.data.fileIdCounter++,
      name: "Getting Started.txt",
      type: "text/plain",
      size: 2048,
      content: "Here's how to get started with FileVault...",
      userId,
      folder: "",
      dateAdded: now,
      lastAccessed: now,
      isDeleted: false,
      isShared: false,
      isStarred: false,
      isFolder: false
    };

    this.data.files.push(welcomeFile);
    this.data.files.push(gettingStartedFile);
    await this.saveData();
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.data.files.find(file => file.id === id);
  }

  async getFilesByUserId(userId: number, includeDeleted: boolean = false): Promise<File[]> {
    return this.data.files.filter(
      file => file.userId === userId && (includeDeleted || !file.isDeleted)
    );
  }

  async getDeletedFiles(userId: number): Promise<File[]> {
    return this.data.files.filter(
      file => file.userId === userId && file.isDeleted
    );
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.data.fileIdCounter++;
    const now = new Date();
    const file: File = {
      id,
      name: insertFile.name,
      type: insertFile.type,
      size: insertFile.size,
      content: insertFile.content,
      userId: insertFile.userId,
      folder: insertFile.folder || "",
      dateAdded: now ?? null,
      lastAccessed: insertFile.lastAccessed ?? now ?? null,
      isDeleted: false,
      isShared: false,
      isStarred: false,
      isFolder: insertFile.isFolder || false,
    };
    this.data.files.push(file);
    this.saveData();
    return file;
  }

  async updateFile(id: number, updates: Partial<File>): Promise<File | undefined> {
    const index = this.data.files.findIndex(file => file.id === id);
    if (index === -1) return undefined;

    const updatedFile = { ...this.data.files[index], ...updates };
    this.data.files[index] = updatedFile;
    this.saveData();
    
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    const index = this.data.files.findIndex(file => file.id === id);
    if (index === -1) return false;

    this.data.files[index] = { ...this.data.files[index], isDeleted: true };
    this.saveData();
    
    return true;
  }

  async permanentlyDeleteFile(id: number): Promise<boolean> {
    const initialLength = this.data.files.length;
    this.data.files = this.data.files.filter(file => file.id !== id);
    
    if (this.data.files.length !== initialLength) {
      this.saveData();
      return true;
    }
    
    return false;
  }

  // Share Link methods
  async createShareLink(insertShareLink: InsertShareLink): Promise<ShareLink> {
    const id = this.data.shareLinkIdCounter++;
    const shareLink: ShareLink = {
      id,
      ...insertShareLink,
      createdAt: new Date(),
      expiryDate: insertShareLink.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    };
    
    this.data.shareLinks.push(shareLink);
    this.saveData();
    
    return shareLink;
  }

  async getShareLink(token: string): Promise<ShareLink | undefined> {
    return this.data.shareLinks.find(
      link => link.token === token
    );
  }

  async deleteShareLink(id: number): Promise<boolean> {
    const initialLength = this.data.shareLinks.length;
    this.data.shareLinks = this.data.shareLinks.filter(link => link.id !== id);
    
    if (this.data.shareLinks.length !== initialLength) {
      this.saveData();
      return true;
    }
    
    return false;
  }

  async getShareLinksByFileId(fileId: number): Promise<ShareLink[]> {
    return this.data.shareLinks.filter(link => link.fileId === fileId);
  }

  async updateUser(id: number, updates: { name?: string | null; username?: string | null; photoURL?: string | null }): Promise<User> {
    const index = this.data.users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error("User not found");
    }

    // Create updated user object
    const updatedUser = {
      ...this.data.users[index],
      name: updates.name ?? this.data.users[index].name,
      username: updates.username ?? this.data.users[index].username,
      photoURL: updates.photoURL ?? this.data.users[index].photoURL
    };

    this.data.users[index] = updatedUser;
    this.saveData();
    
    return updatedUser;
  }
}

// Export the appropriate storage implementation
// Use FileStorage for persistence between server restarts
export const storage = new FileStorage();
