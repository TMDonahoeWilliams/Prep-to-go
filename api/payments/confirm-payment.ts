import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  userEmail: z.string().email("Invalid email address"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // Only handle POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Payment confirmation requested:', JSON.stringify(req.body));

    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    // Validate request body with Zod
    const validationResult = confirmPaymentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const { paymentIntentId, userEmail } = validationResult.data;

    // For demo purposes, simulate successful payment confirmation
    // In a real production app, you would:
    // 1. Verify the payment with Stripe using the payment intent ID
    // 2. Update the user's payment status in your database
    // 3. Create a subscription or access record
    
    console.log(`Confirming payment for ${userEmail} with intent ${paymentIntentId}`);

    // Simulate successful payment confirmation
    const confirmation = {
      success: true,
      paymentIntentId: paymentIntentId,
      userEmail: userEmail,
      amount: 499, // $4.99 in cents
      currency: 'usd',
      status: 'succeeded',
      confirmedAt: new Date().toISOString(),
      accessGranted: true,
      subscription: {
        status: 'active',
        planType: 'basic',
        expiresAt: null, // lifetime access
      }
    };

    console.log('Payment confirmed successfully for:', userEmail);

    return res.status(200).json(confirmation);

  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    
    // Ensure we always return JSON, even on errors
    try {
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to confirm payment',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } catch (jsonError) {
      // If JSON fails, return plain text
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}