import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validate request body shape
const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  currency: z.string().min(3, "Currency must be at least 3 characters"),
  userEmail: z.string().email("Invalid email address"),
  priceId: z.string().min(1, "Price ID is required"),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Always catch errors and return JSON so callers get a useful message
  try {
    // CORS + JSON headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!req.body) {
      return res.status(400).json({ message: 'Request body is required' });
    }

    // Validate request body
    const validation = createPaymentIntentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { amount, currency, userEmail, priceId } = validation.data;

    // Ensure Stripe secret key is configured
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ message: 'Payment system not configured' });
    }

    // Dynamically import Stripe at runtime. Doing this inside the handler avoids
    // "Stripe is not defined" or bundling/resolution issues during module init on Vercel.
    const StripeLib = (await import('stripe')).default as typeof import('stripe').default;
    const stripe = new StripeLib(stripeSecret, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    console.log(`Creating payment intent for ${userEmail}: $${(amount / 100).toFixed(2)} ${currency}`);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        userEmail,
        priceId,
        product: 'college-prep-organizer',
      },
      description: 'College Prep Organizer - Lifetime Access',
      receipt_email: userEmail,
    });

    console.log('Payment intent created:', paymentIntent.id);

    return res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    // Map common Stripe errors where possible
    if (error?.type === 'StripeCardError') {
      return res.status(400).json({ success: false, message: error.message, type: 'card_error' });
    }
    if (error?.type === 'StripeRateLimitError') {
      return res.status(429).json({ success: false, message: 'Too many requests, please try again later' });
    }
    if (error?.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ success: false, message: 'Invalid request parameters' });
    }
    if (error?.type === 'StripeAPIError' || error?.type === 'StripeConnectionError' || error?.type === 'StripeAuthenticationError') {
      return res.status(500).json({ success: false, message: 'Payment service error' });
    }

    // Generic fallback with safe JSON
    try {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to create payment intent',
        error: process.env.NODE_ENV === 'development' ? (error?.stack || String(error)) : undefined,
      });
    } catch {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}
