import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// For now, let's implement a simple demo version that works with Vercel
// In a real production app, you'd use a proper database connection

const SALT_ROUNDS = 12;

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Log the request for debugging
    console.log('Registration request:', req.body);

    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // For demo purposes, simulate user creation
    // In a real production app, you would connect to your database here
    
    // Simulate checking if user exists (always allow for demo)
    const userExists = false; // In real app: check database
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password (for security even in demo)
    const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    
    // Create demo user object
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      profileImageUrl: null,
      role: null, // Will be set during role selection
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('User registered successfully:', newUser.email);
    
    // Return user data
    return res.status(201).json(newUser);
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    return res.status(500).json({ 
      message: error.message || 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}