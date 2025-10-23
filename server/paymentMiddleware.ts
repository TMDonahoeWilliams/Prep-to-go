import type { Request, Response, NextFunction } from "express";
import { paymentStorage } from "./payments";

// Middleware to check if user has paid access
export const requirePaidAccess = async (
  req: any, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // First check if user is authenticated
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ 
        message: "Authentication required",
        requiresPayment: false 
      });
    }

    const userId = req.user.claims.sub;
    
    // Check if user has paid access
    const hasPaidAccess = await paymentStorage.hasUserPaidAccess(userId);
    
    if (!hasPaidAccess) {
      return res.status(402).json({ 
        message: "Payment required to access this feature",
        requiresPayment: true,
        userEmail: req.user.claims.email
      });
    }

    // User has paid access, continue
    next();
  } catch (error) {
    console.error("Error checking paid access:", error);
    res.status(500).json({ 
      message: "Error verifying access",
      requiresPayment: false 
    });
  }
};