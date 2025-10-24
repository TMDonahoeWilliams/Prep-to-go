import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url = '', method } = req;
  
  // Log for debugging
  console.log('API Request:', { url, method, fullUrl: req.url });
  
  // Handle debug endpoint - check multiple possible URL formats
  if ((url.includes('/debug') || url === '/debug') && method === 'GET') {
    return res.json({
      NODE_ENV: process.env.NODE_ENV,
      DEV_AUTH: process.env.DEV_AUTH,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      useDevAuth: process.env.NODE_ENV === 'development' || process.env.DEV_AUTH === 'true',
      requestUrl: url,
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle login fallback
  if ((url.includes('/login-fallback') || url === '/login-fallback') && method === 'GET') {
    res.setHeader('Location', '/');
    return res.status(302).end();
  }
  
  // Handle health check
  if ((url.includes('/health') || url === '/health') && method === 'GET') {
    return res.json({ 
      status: 'ok', 
      service: 'College Prep Organizer',
      requestUrl: url,
      timestamp: new Date().toISOString()
    });
  }
  
  // Default response with debug info
  return res.status(200).json({ 
    message: 'API handler working',
    url,
    method,
    availableEndpoints: ['/debug', '/health', '/login-fallback'],
    timestamp: new Date().toISOString()
  });
}