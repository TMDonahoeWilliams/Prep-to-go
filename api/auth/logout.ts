import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow both GET and POST requests for logout
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For serverless functions, we don't have persistent sessions
    // The main logout logic happens on the client side (clearing localStorage)
    
    // Set headers to clear any cookies that might exist
    res.setHeader('Set-Cookie', [
      'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    ]);

    if (req.method === 'GET') {
      // GET request - redirect to landing page
      res.redirect(302, '/');
    } else {
      // POST request - return JSON response
      res.status(200).json({ message: 'Logged out successfully' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    
    if (req.method === 'GET') {
      // Even if there's an error, redirect to landing page
      res.redirect(302, '/');
    } else {
      res.status(500).json({ message: 'Logout failed' });
    }
  }
}