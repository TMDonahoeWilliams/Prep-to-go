import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    // This endpoint should NOT be used in the serverless demo
    // All user data should come from localStorage only
    // Return error to force client to use localStorage
    
    console.log('User API endpoint called - this should not happen in serverless demo');
    
    return res.status(404).json({ 
      message: 'User data should be retrieved from localStorage in serverless demo mode',
      redirect: 'Use localStorage data only'
    });
    
  } catch (error: any) {
    console.error('User fetch error:', error);
    return res.status(500).json({ 
      message: error.message || 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}