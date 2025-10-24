import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Payment access check requested');

    // For demo purposes, check if user has completed payment in this session
    // In a real app, you'd check the database for payment records
    // We'll simulate payment status - in demo, all users start unpaid
    const paymentStatus = {
      hasPaidAccess: false, // Always false for demo - user must go through payment flow
      subscriptionStatus: 'inactive',
      planType: null,
      expiresAt: null,
      trialEndsAt: null,
      message: 'Demo mode - complete payment flow to access app'
    };

    console.log('Returning payment status:', paymentStatus);

    return res.status(200).json(paymentStatus);

  } catch (error: any) {
    console.error('Payment check error:', error);
    
    // Ensure we always return JSON
    try {
      return res.status(500).json({ 
        message: error.message || 'Failed to check payment status',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } catch (jsonError) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}