import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import Stripe from 'stripe';

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

    // Verify Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ message: 'Payment system not configured' });
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    }

    console.log(`Creating payment intent for ${userEmail}: $${amount/100} ${currency}`);

    // Create real Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userEmail: userEmail,
        priceId: priceId,
        product: 'college-prep-organizer'
      },
      description: 'College Prep Organizer - Lifetime Access',
      receipt_email: userEmail,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    return res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      clientSecret: paymentIntent.client_secret
    });

  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        success: false,
        message: error.message,
        type: 'card_error'
      });
    }

    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }

    if (error.type === 'StripeAPIError') {
      return res.status(500).json({
        success: false,
        message: 'Payment service temporarily unavailable'
      });
    }

    if (error.type === 'StripeConnectionError') {
      return res.status(500).json({
        success: false,
        message: 'Network error, please try again'
      });
    }

    if (error.type === 'StripeAuthenticationError') {
      console.error('Stripe authentication failed - check API keys');
      return res.status(500).json({
        success: false,
        message: 'Payment system configuration error'
      });
    }
    
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