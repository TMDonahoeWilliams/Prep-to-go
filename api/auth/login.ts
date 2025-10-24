import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
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
    console.log('Login request:', req.body);

    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // For demo purposes, simulate user lookup
    // In a real production app, you would query your database here
    
    // Demo user data (in real app, this would come from database)
    const demoUser = {
      id: 'demo-user-123',
      email: validatedData.email,
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: null,
      role: null,
      emailVerified: true,
      passwordHash: '$2b$12$example.hash.here', // This would be the real hash from DB
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // For demo, accept any password (in real app, verify against stored hash)
    const userExists = true; // In real app: check if user exists in database
    
    if (!userExists) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Skip password verification for demo (in real app, use bcrypt.compare)
    const isValidPassword = true; // In real app: await bcrypt.compare(validatedData.password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    console.log('User logged in successfully:', demoUser.email);
    
    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = demoUser;
    
    return res.status(200).json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Login error:', error);
    
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
      message: error.message || 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}