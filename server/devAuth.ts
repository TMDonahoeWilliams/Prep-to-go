// Development authentication bypass
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

// Mock user for development
const DEV_USER = {
  claims: {
    sub: "dev-user-123",
    email: "dev@example.com",
    first_name: "Development",
    last_name: "User",
    profile_image_url: null
  }
};

export async function setupDevAuth(app: Express) {
  console.log("🔧 Setting up development authentication bypass");
  
  // Create/update the dev user in database
  try {
    await storage.upsertUser({
      id: DEV_USER.claims.sub,
      email: DEV_USER.claims.email,
      firstName: DEV_USER.claims.first_name,
      lastName: DEV_USER.claims.last_name,
      profileImageUrl: DEV_USER.claims.profile_image_url,
    });
    console.log("✅ Development user created/updated");
  } catch (error) {
    console.error("❌ Error creating dev user:", error);
  }

  // Mock login route
  app.get("/api/login", (req, res) => {
    console.log("🔓 Development login - bypassing authentication");
    res.redirect("/");
  });

  // Mock logout route  
  app.get("/api/logout", (req, res) => {
    console.log("🔓 Development logout");
    res.redirect("/");
  });

  // Mock callback route
  app.get("/api/callback", (req, res) => {
    console.log("🔓 Development callback");
    res.redirect("/");
  });
}

// Mock authentication middleware
export const isDevAuthenticated: RequestHandler = (req: any, res, next) => {
  // Attach mock user to request
  req.user = DEV_USER;
  req.isAuthenticated = () => true;
  next();
};