import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Connect to database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    
    // Get user by email
    const userResult = await db.select().from(users).where(eq(users.email, validatedData.email));
    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = userResult[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Clean up connection
    await pool.end();
    
    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Login failed'
    });
  }
}