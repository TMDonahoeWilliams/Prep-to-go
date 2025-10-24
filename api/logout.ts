import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests for logout
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For serverless functions, we don't have persistent sessions
    // The main logout logic happens on the client side (clearing localStorage)
    // This endpoint just provides a consistent API response and redirect
    
    // Set headers to clear any cookies that might exist
    res.setHeader('Set-Cookie', [
      'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
      'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly'
    ]);

    // Redirect to landing page
    res.redirect(302, '/');
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, redirect to landing page
    res.redirect(302, '/');
  }
}