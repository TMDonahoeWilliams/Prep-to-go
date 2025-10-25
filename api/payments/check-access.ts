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

    // For demo purposes, API always returns "no access" - payment status is managed via localStorage
    // The usePaymentStatus hook checks localStorage first, then falls back to this API
    // This ensures the payment flow works correctly in demo mode
    const paymentStatus = {
      hasPaidAccess: false, // Always false from API - localStorage overrides after payment
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