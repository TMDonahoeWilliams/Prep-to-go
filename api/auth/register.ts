import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

const SALT_ROUNDS = 12;

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
    
    // Create user
    const newUser = await db.insert(users).values({
      email: validatedData.email,
      passwordHash,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: null, // Will be set during role selection
      emailVerified: false,
    }).returning();
    
    // Clean up connection
    await pool.end();
    
    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser[0];
    
    res.status(201).json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Registration failed'
    });
  }
}