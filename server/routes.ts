import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { signalValidationSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { verifyWhopUser, WhopUserVerification } from "./whop-sdk";

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    const record = rateLimitMap.get(key);
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ message: "Too many requests" });
    }
    
    record.count++;
    next();
  };
}

// Whop authentication middleware
async function whopAuthMiddleware(req: any, res: any, next: any) {
  try {
    const verification = await verifyWhopUser(req.headers);
    
    if (!verification.hasAccess) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.whopUser = verification;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.whopUser || req.whopUser.accessLevel !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Whop notification function (to be implemented with actual Whop SDK)
async function sendWhopNotification(userIds: string[], title: string, body: string) {
  // TODO: Implement actual Whop SDK notification
  console.log(`Sending notification to ${userIds.length} users:`, { title, body });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Webhook endpoint for Whop membership events
  app.post("/api/whop/webhook", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      await storage.createAuditLog({
        action: `whop_webhook_${type}`,
        metadata: data,
        userId: null,
        resourceType: 'webhook',
        resourceId: null,
      });
      
      switch (type) {
        case "membership_created":
        case "membership_updated":
          const userData = {
            whopUserId: data.user_id,
            name: data.user.name || data.user.username,
            email: data.user.email,
            role: data.product.role === "admin" ? "ADMIN" : "SUBSCRIBER",
            productId: data.product.id,
            membershipId: data.membership.id,
          };
          
          const existingUser = await storage.getUserByWhopId(data.user_id);
          if (existingUser) {
            await storage.updateUser(existingUser.id, userData);
          } else {
            await storage.createUser(userData);
          }
          break;
          
        case "membership_deleted":
          // Handle membership revocation
          break;
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Webhook error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user profile
  app.get("/api/user/profile", whopAuthMiddleware, async (req, res) => {
    try {
      const user = await storage.getUserByWhopId(req.whopUser.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get signals feed
  app.get("/api/signals", whopAuthMiddleware, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const signals = await storage.getSignals(limit, offset);
      res.json(signals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new signal (Admin only)
  app.post("/api/signals", rateLimit(10, 60000), whopAuthMiddleware, requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUserByWhopId(req.whopUser.userId);
      
      // Validate signal data
      const validatedData = signalValidationSchema.parse(req.body);
      
      // Calculate R/R ratios for take profits
      const entry = parseFloat(validatedData.entry);
      const stopLoss = parseFloat(validatedData.stopLoss);
      const isLong = validatedData.side === "BUY" || validatedData.side === "BUY_LIMIT";
      const risk = Math.abs(entry - stopLoss);
      
      const takeProfitsWithRatio = validatedData.takeProfits.map((tp) => {
        const tpPrice = parseFloat(tp.price);
        let reward: number;
        
        if (isLong) {
          reward = tpPrice - entry;
        } else {
          reward = entry - tpPrice;
        }
        
        const ratio = (reward / risk).toFixed(1);
        return {
          price: tp.price,
          ratio: `${ratio}R`,
        };
      });
      
      // Create signal
      const signal = await storage.createSignal({
        ...validatedData,
        takeProfits: takeProfitsWithRatio,
        createdBy: user.id,
      });
      
      // Update signal as sent
      await storage.updateSignal(signal.id, { sentAt: new Date() });
      
      // Log action
      await storage.createAuditLog({
        action: "signal_created",
        userId: user.id,
        resourceType: "signal",
        resourceId: signal.id,
        metadata: { instrument: signal.instrument, side: signal.side },
      });
      
      // Send notifications to all subscribers
      // TODO: Get all subscribers and send Whop notifications
      const notificationTitle = `${validatedData.side} · ${validatedData.instrument}`;
      const tpString = takeProfitsWithRatio.map((tp, i) => `TP${i+1}: ${tp.price}`).join(", ");
      const rrString = takeProfitsWithRatio.map((tp, i) => `TP${i+1}: ${tp.ratio}`).join("; ");
      
      const notificationBody = `Hi {FirstName},

Entry: ${validatedData.entry} | SL: ${validatedData.stopLoss} | TP(s): ${tpString || "–"}
R/R: ${rrString || "–"}${validatedData.riskTag ? `\n${validatedData.riskTag}` : ""}`;

      // await sendWhopNotification(subscriberIds, notificationTitle, notificationBody);
      
      res.json(signal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Mark signal as read
  app.post("/api/signals/:id/read", whopAuthMiddleware, async (req, res) => {
    try {
      const signalId = req.params.id;
      
      const user = await storage.getUserByWhopId(req.whopUser.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const signal = await storage.getSignal(signalId);
      if (!signal) {
        return res.status(404).json({ message: "Signal not found" });
      }
      
      const signalRead = await storage.markSignalAsRead(signalId, user.id);
      
      await storage.createAuditLog({
        action: "signal_read",
        userId: user.id,
        resourceType: "signal",
        resourceId: signalId,
        metadata: {},
      });
      
      res.json(signalRead);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get signal read status
  app.get("/api/signals/:id/reads", whopAuthMiddleware, requireAdmin, async (req, res) => {
    try {
      const signalId = req.params.id;
      const reads = await storage.getSignalReads(signalId);
      
      res.json({
        count: reads.length,
        reads: reads.map(r => ({
          userId: r.userId,
          readAt: r.readAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user statistics
  app.get("/api/user/stats", whopAuthMiddleware, async (req, res) => {
    try {
      const user = await storage.getUserByWhopId(req.whopUser.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
