import { db } from "./db";
import { users, signals, signalReads, auditLogs } from "@shared/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import type { User, InsertUser, Signal, InsertSignal, SignalRead, AuditLog } from "@shared/schema";
import type { IStorage } from "./storage";

export class DrizzleStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByWhopId(whopUserId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.whopUserId, whopUserId)).limit(1);
    return result[0];
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
    
    await db.insert(users).values(user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const updatedData = { ...data, updatedAt: new Date() };
    const result = await db.update(users)
      .set(updatedData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async createSignal(signal: InsertSignal & { createdBy: string }): Promise<Signal> {
    const id = randomUUID();
    const now = new Date();
    const newSignal: Signal = {
      ...signal,
      id,
      createdAt: now,
      sentAt: null,
    };
    
    await db.insert(signals).values(newSignal);
    return newSignal;
  }

  async getSignals(limit = 20, offset = 0): Promise<Signal[]> {
    return await db.select()
      .from(signals)
      .orderBy(desc(signals.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getSignal(id: string): Promise<Signal | undefined> {
    const result = await db.select().from(signals).where(eq(signals.id, id)).limit(1);
    return result[0];
  }

  async updateSignal(id: string, data: Partial<Signal>): Promise<Signal | undefined> {
    const result = await db.update(signals)
      .set(data)
      .where(eq(signals.id, id))
      .returning();
    
    return result[0];
  }

  async markSignalAsRead(signalId: string, userId: string): Promise<SignalRead> {
    const id = randomUUID();
    const now = new Date();
    const signalRead: SignalRead = {
      id,
      signalId,
      userId,
      readAt: now,
    };
    
    await db.insert(signalReads).values(signalRead);
    return signalRead;
  }

  async getSignalReads(signalId: string): Promise<SignalRead[]> {
    return await db.select()
      .from(signalReads)
      .where(eq(signalReads.signalId, signalId))
      .orderBy(desc(signalReads.readAt));
  }

  async getUserSignalReads(userId: string): Promise<SignalRead[]> {
    return await db.select()
      .from(signalReads)
      .where(eq(signalReads.userId, userId))
      .orderBy(desc(signalReads.readAt));
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const id = randomUUID();
    const now = new Date();
    const auditLog: AuditLog = {
      ...log,
      id,
      createdAt: now,
    };
    
    await db.insert(auditLogs).values(auditLog);
    return auditLog;
  }

  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    return await db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }

  async getUserStats(userId: string): Promise<{
    totalSignals: number;
    readSignals: number;
    winRate: number;
    avgRR: number;
  }> {
    const totalSignalsResult = await db.select({ count: count() })
      .from(signals)
      .where(eq(signals.createdBy, userId));
    
    const readSignalsResult = await db.select({ count: count() })
      .from(signalReads)
      .where(eq(signalReads.userId, userId));
    
    const totalSignals = totalSignalsResult[0]?.count || 0;
    const readSignals = readSignalsResult[0]?.count || 0;
    
    // TODO: Calculate actual win rate and avg R/R from completed signals
    return {
      totalSignals,
      readSignals,
      winRate: 0,
      avgRR: 0,
    };
  }
}