import { type User, type InsertUser, type Signal, type InsertSignal, type SignalRead, type AuditLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByWhopId(whopUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  
  // Signal operations
  createSignal(signal: InsertSignal & { createdBy: string }): Promise<Signal>;
  getSignals(limit?: number, offset?: number): Promise<Signal[]>;
  getSignal(id: string): Promise<Signal | undefined>;
  updateSignal(id: string, data: Partial<Signal>): Promise<Signal | undefined>;
  
  // Signal read operations
  markSignalAsRead(signalId: string, userId: string): Promise<SignalRead>;
  getSignalReads(signalId: string): Promise<SignalRead[]>;
  getUserSignalReads(userId: string): Promise<SignalRead[]>;
  
  // Audit log operations
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalSignals: number;
    readSignals: number;
    winRate: number;
    avgRR: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private signals: Map<string, Signal>;
  private signalReads: Map<string, SignalRead>;
  private auditLogs: Map<string, AuditLog>;

  constructor() {
    this.users = new Map();
    this.signals = new Map();
    this.signalReads = new Map();
    this.auditLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWhopId(whopUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.whopUserId === whopUserId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { 
      ...user, 
      ...data, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createSignal(signalData: InsertSignal & { createdBy: string }): Promise<Signal> {
    const id = randomUUID();
    const now = new Date();
    const signal: Signal = {
      ...signalData,
      id,
      createdAt: now,
      sentAt: null,
    };
    this.signals.set(id, signal);
    return signal;
  }

  async getSignals(limit = 50, offset = 0): Promise<Signal[]> {
    const allSignals = Array.from(this.signals.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allSignals.slice(offset, offset + limit);
  }

  async getSignal(id: string): Promise<Signal | undefined> {
    return this.signals.get(id);
  }

  async updateSignal(id: string, data: Partial<Signal>): Promise<Signal | undefined> {
    const signal = this.signals.get(id);
    if (!signal) return undefined;
    
    const updatedSignal: Signal = { ...signal, ...data };
    this.signals.set(id, updatedSignal);
    return updatedSignal;
  }

  async markSignalAsRead(signalId: string, userId: string): Promise<SignalRead> {
    const id = randomUUID();
    const signalRead: SignalRead = {
      id,
      signalId,
      userId,
      readAt: new Date(),
    };
    this.signalReads.set(id, signalRead);
    return signalRead;
  }

  async getSignalReads(signalId: string): Promise<SignalRead[]> {
    return Array.from(this.signalReads.values()).filter(
      (read) => read.signalId === signalId
    );
  }

  async getUserSignalReads(userId: string): Promise<SignalRead[]> {
    return Array.from(this.signalReads.values()).filter(
      (read) => read.userId === userId
    );
  }

  async createAuditLog(logData: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const id = randomUUID();
    const auditLog: AuditLog = {
      ...logData,
      id,
      createdAt: new Date(),
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }

  async getAuditLogs(limit = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUserStats(userId: string): Promise<{
    totalSignals: number;
    readSignals: number;
    winRate: number;
    avgRR: number;
  }> {
    const userReads = await this.getUserSignalReads(userId);
    const totalSignals = this.signals.size;
    const readSignals = userReads.length;
    
    // Mock calculations for demo
    return {
      totalSignals,
      readSignals,
      winRate: 73.2,
      avgRR: 2.4,
    };
  }
}

export const storage = new MemStorage();
