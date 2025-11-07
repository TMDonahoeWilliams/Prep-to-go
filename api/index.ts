// (Replace the existing payments/check-access demo block with this)
  // Handle payment status check
  if ((url.includes('/payments/check-access') || url === '/payments/check-access') && method === 'GET') {
    const demoPaywall = (process.env.DEMO_PAYWALL === 'true');

    if (demoPaywall) {
      // Explicit demo mode: return demo response
      return res.json({
        hasPaidAccess: false,
        subscriptionStatus: 'inactive',
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        message: 'Demo mode - complete payment flow to access app'
      });
    }

    // Not demo mode: delegate to the real payments/check-access handler
    try {
      // dynamic import so Vercel runtime resolves the correct file
      const { default: checkAccessHandler } = await import('./payments/check-access');
      return checkAccessHandler(req, res);
    } catch (err) {
      console.error('Failed to route to /api/payments/check-access handler:', err);
      return res.status(500).json({
        message: 'Server misconfiguration: payments handler not available'
      });
    }
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
