import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const roleSchema = z.enum(['student', 'parent']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only handle PATCH requests
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Role update request received:', req.body);

    const { role } = req.body;
    
    // Validate role
    const validationResult = roleSchema.safeParse(role);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid role. Must be 'student' or 'parent'",
        errors: validationResult.error.issues
      });
    }

    // For serverless deployment, this API should NOT override user data
    // The role selection component should handle updating localStorage directly
    // But we should trigger task seeding for new users
    
    console.log('Role selection API called - client should handle localStorage update and task seeding');
    
    return res.status(200).json({
      success: true,
      role: validationResult.data,
      message: `Role set to ${validationResult.data}. Client should update localStorage and seed tasks.`,
      shouldSeedTasks: true // Flag to tell client to seed tasks
    });
    
  } catch (error: any) {
    console.error('Role update error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to update role',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}