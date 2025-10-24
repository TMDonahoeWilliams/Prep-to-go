import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For serverless deployment, we'll use a simple demo user approach
    // In a real production app, you'd implement proper JWT/session handling
    
    // Return a demo user that triggers role selection
    res.status(200).json({
      id: "demo-user-vercel",
      email: "demo@collegeprep.app",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      role: null, // No role initially - will trigger role selection
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('User fetch error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to fetch user'
    });
  }
}