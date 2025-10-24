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

  // For production deployment, auth endpoints need to be implemented here
  // Return message indicating auth needs to be set up for serverless
  if (url.includes('/auth/')) {
    return res.status(501).json({ 
      message: "Authentication endpoints need serverless implementation for Vercel deployment",
      suggestion: "Use the main server for development, implement serverless auth for production"
    });
  }
  
  // Default response with debug info
  return res.status(200).json({ 
    message: 'Vercel API handler working',
    url,
    method,
    environment: 'vercel',
    availableEndpoints: ['/debug', '/health', '/login-fallback', '/payments/check-access'],
    timestamp: new Date().toISOString()
  });
}