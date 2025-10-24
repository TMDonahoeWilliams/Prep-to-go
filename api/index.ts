import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url, method } = req;
  
  // Handle debug endpoint
  if (url === '/api/debug' && method === 'GET') {
    return res.json({
      NODE_ENV: process.env.NODE_ENV,
      DEV_AUTH: process.env.DEV_AUTH,
      VERCEL: process.env.VERCEL,
      useDevAuth: process.env.NODE_ENV === 'development' || process.env.DEV_AUTH === 'true',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle login fallback
  if (url === '/api/login-fallback' && method === 'GET') {
    res.setHeader('Location', '/');
    return res.status(302).end();
  }
  
  // Handle health check
  if (url === '/api/health' && method === 'GET') {
    return res.json({ 
      status: 'ok', 
      service: 'College Prep Organizer',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default 404 for unhandled routes
  return res.status(404).json({ message: 'API route not found' });
}