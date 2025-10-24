import bcrypt from 'bcrypt';
import { storage } from './storage';
import { registerUserSchema, loginUserSchema, type RegisterUser, type LoginUser } from '@shared/schema';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

const SALT_ROUNDS = 12;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Register new user
export async function registerUser(userData: RegisterUser) {
  try {
    // Validate input
    const validatedData = registerUserSchema.parse(userData);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    // Hash password
    const passwordHash = await hashPassword(validatedData.password);
    
    // Create user (without role initially)
    const newUser = await storage.upsertUser({
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: null, // Will be set during role selection
      emailVerified: false,
    });
    
    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
export async function loginUser(loginData: LoginUser) {
  try {
    // Validate input
    const validatedData = loginUserSchema.parse(loginData);
    
    // Get user by email
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Authentication middleware
export const requireAuth: RequestHandler = (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Attach user to request
export const attachUser: RequestHandler = async (req: any, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        // Attach user in the format expected by existing routes
        req.user = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl
          }
        };
        req.isAuthenticated = () => true;
      }
    } catch (error) {
      console.error('Error attaching user:', error);
    }
  }
  next();
};

// Logout user
export function logoutUser(req: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}