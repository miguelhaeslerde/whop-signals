import { Request, Response, NextFunction } from "express";
import { whopSdk } from "../../lib/whop-sdk";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'customer' | 'no_access';
    hasAccess: boolean;
  };
}

export async function whopAuthMiddleware(
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) {
  try {
    // Extract user ID from headers (sent by Whop iframe)
    const userId = req.headers['x-whop-user-id'] as string;
    const experienceId = req.headers['x-whop-experience-id'] as string || 'default';

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID provided" });
    }

    // Verify user access through Whop SDK
    const accessResult = await whopSdk.access.checkIfUserHasAccessToExperience({
      userId,
      experienceId,
    });

    if (!accessResult.hasAccess) {
      return res.status(403).json({ message: "Forbidden: User does not have access" });
    }

    // Attach user info to request
    req.user = {
      id: userId,
      role: accessResult.accessLevel,
      hasAccess: accessResult.hasAccess,
    };

    next();
  } catch (error) {
    console.error('Whop auth middleware error:', error);
    return res.status(500).json({ message: "Internal server error during authentication" });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }

  next();
}