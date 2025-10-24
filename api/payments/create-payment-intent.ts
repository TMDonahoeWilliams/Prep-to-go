import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.string().min(3, "Currency must be at least 3 characters"),
  userEmail: z.string().email("Invalid email address"),
  priceId: z.string().min(1, "Price ID is required"),
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

    console.log('Payment intent creation requested:', JSON.stringify(req.body));

    // Validate request body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    // Validate request body with Zod
    const validationResult = createPaymentIntentSchema.safeParse(req.body);
    
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

    const { amount, currency, userEmail, priceId } = validationResult.data;

    // For demo purposes, simulate successful payment intent creation
    // In a real production app, you would:
    // 1. Initialize Stripe with your secret key
    // 2. Create a real payment intent with Stripe
    // 3. Return the client_secret for frontend processing
    
    console.log(`Creating payment intent for ${userEmail}: $${amount/100} ${currency}`);

    // Simulate Stripe payment intent response
    const paymentIntent = {
      id: `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      client_secret: `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substr(2, 16)}`,
      amount: amount,
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        userEmail: userEmail,
        priceId: priceId
      }
    };

    console.log('Payment intent created successfully:', paymentIntent.id);

    return res.status(200).json({
      success: true,
      paymentIntent: paymentIntent,
      clientSecret: paymentIntent.client_secret
    });

  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    
    // Ensure we always return JSON, even on errors
    try {
      return res.status(500).json({ 
        success: false,
        message: error.message || 'Failed to create payment intent',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } catch (jsonError) {
      // If JSON fails, return plain text
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}