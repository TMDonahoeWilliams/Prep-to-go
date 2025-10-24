import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url = '', method } = req;
  
  // Only handle API requests when running on Vercel, not in local development
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log for debugging
  console.log('API Request:', { url, method, fullUrl: req.url, isVercel, isProduction });
  
  // In local development, let the main server handle everything
  if (!isVercel && !isProduction) {
    return res.status(404).json({ 
      message: "Local development - routes handled by main server",
      redirectToMainServer: true 
    });
  }
  
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
  
  // Handle payment status check - for Vercel deployment, return no paid access to show paywall
  if ((url.includes('/payments/check-access') || url === '/payments/check-access') && method === 'GET') {
    return res.json({
      hasPaidAccess: false  // Always show paywall in demo mode on Vercel
    });
  }

  // Handle authentication endpoints for Vercel deployment
  if (url.includes('/auth/register') && method === 'POST') {
    // Import and call the register handler
    const { default: registerHandler } = await import('./auth/register');
    return registerHandler(req, res);
  }
  
  if (url.includes('/auth/login') && method === 'POST') {
    // Import and call the login handler
    const { default: loginHandler } = await import('./auth/login');
    return loginHandler(req, res);
  }
  
  if (url.includes('/auth/user/role') && method === 'PATCH') {
    // Import and call the role update handler
    const { default: roleHandler } = await import('./auth/user/role');
    return roleHandler(req, res);
  }
  
  if (url.includes('/auth/user') && method === 'GET') {
    // Import and call the user handler
    const { default: userHandler } = await import('./auth/user');
    return userHandler(req, res);
  }

  // Handle logout endpoints
  if (url.includes('/logout') && (method === 'GET' || method === 'POST')) {
    // Clear any cookies and redirect to landing page
    res.setHeader('Set-Cookie', [
      'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    ]);
    
    if (method === 'GET') {
      // GET request - redirect to landing page
      res.setHeader('Location', '/');
      return res.status(302).end();
    } else {
      // POST request - return JSON response
      return res.status(200).json({ message: 'Logged out successfully' });
    }
  }
  
  // Default response with debug info
  return res.status(200).json({ 
    message: 'Vercel API handler working',
    url,
    method,
    environment: 'vercel',
    availableEndpoints: ['/debug', '/health', '/login-fallback', '/logout', '/payments/check-access'],
    timestamp: new Date().toISOString()
  });
}