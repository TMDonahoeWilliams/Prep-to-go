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
  
  // Handle payment status check - for development, return no paid access to show paywall
  if ((url.includes('/payments/check-access') || url === '/payments/check-access') && method === 'GET') {
    return res.json({
      hasPaidAccess: false  // Always show paywall in development/demo mode
    });
  }

  // Handle user info endpoint
  if ((url.includes('/auth/user') || url === '/auth/user') && method === 'GET') {
    return res.json({
      id: "dev-user-123",
      email: "dev@example.com",
      firstName: "Development", 
      lastName: "User",
      profileImageUrl: null,
      role: null,  // No role initially - will trigger role selection
      createdAt: new Date().toISOString()
    });
  }

  // Handle user role update
  if ((url.includes('/auth/user/role') || url === '/auth/user/role') && method === 'PATCH') {
    // Get role from request body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { role } = body || {};
    
    if (!role || !['student', 'parent'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Return updated user with role
    return res.json({
      id: "dev-user-123",
      email: "dev@example.com", 
      firstName: "Development",
      lastName: "User",
      profileImageUrl: null,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  // Default response with debug info
  return res.status(200).json({ 
    message: 'API handler working',
    url,
    method,
    availableEndpoints: ['/debug', '/health', '/login-fallback', '/payments/check-access'],
    timestamp: new Date().toISOString()
  });
}