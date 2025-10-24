import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Configure Neon for serverless
neonConfig.fetchConnectionCache = true;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('User data request received');

    // For serverless deployment demo, check localStorage data on client side
    // In a real production app, you'd implement proper JWT/session handling
    
    // Return a demo user that triggers role selection
    const demoUser = {
      id: "demo-user-vercel",
      email: "demo@collegeprep.app",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      role: null, // No role initially - will trigger role selection
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('Returning demo user data');
    
    return res.status(200).json(demoUser);
    
  } catch (error: any) {
    console.error('User fetch error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}