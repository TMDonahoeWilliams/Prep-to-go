import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import Stripe from 'stripe';
import { paymentStorage } from '../../server/payments';

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

    // Verify Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return res.status(500).json({ message: 'Payment system not configured' });
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });

    console.log(`Confirming payment for ${userEmail} with intent ${paymentIntentId}`);

    // Retrieve the payment intent from Stripe to verify its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({
        success: false,
        message: 'Payment intent not found'
      });
    }

    // Check if payment was successful
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
        status: paymentIntent.status
      });
    }

    // Verify email matches (optional security check)
    if (paymentIntent.metadata?.userEmail !== userEmail) {
      console.warn(`Email mismatch: expected ${userEmail}, got ${paymentIntent.metadata?.userEmail}`);
    }

    console.log(`Looking up user by email: ${userEmail}`);
    
    // Look up user by email to get userId
    const userResult = await paymentStorage.getUserByEmail(userEmail);
    
    if (!userResult || userResult.length === 0) {
      console.error(`User not found for email: ${userEmail}`);
      return res.status(400).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }
    
    const user = userResult[0];
    console.log(`User found: ${user.id} (${user.email})`);

    // Check if user already has an active subscription
    // Note: We check before inserting because upsertSubscription uses stripeSubscriptionId 
    // as conflict target, which is NULL for one-time payments. This prevents duplicate 
    // subscription records when the same user makes multiple one-time payments.
    const existingSubscription = await paymentStorage.getUserSubscription(user.id);
    
    let dbSubscription;
    
    if (existingSubscription && existingSubscription.length > 0) {
      // User already has an active subscription
      dbSubscription = existingSubscription[0];
      console.log(`User already has active subscription: ${dbSubscription.id}`);
    } else {
      // Create new subscription record for this user
      const currentPeriodStart = new Date();
      console.log(`Creating subscription for user ${user.id}`);
      
      const subscriptionData = {
        userId: user.id,
        stripeCustomerId: paymentIntent.customer as string | null,
        stripeSubscriptionId: null, // One-time payment, no subscription ID
        stripePriceId: null,
        status: 'active',
        currentPeriodStart: currentPeriodStart,
        currentPeriodEnd: null, // null for lifetime access
        cancelAtPeriodEnd: false,
      };
      
      const dbSubscriptionResult = await paymentStorage.upsertSubscription(subscriptionData);
      
      if (!dbSubscriptionResult || dbSubscriptionResult.length === 0) {
        console.error('Failed to create subscription record');
        return res.status(500).json({
          success: false,
          message: 'Failed to create subscription record'
        });
      }
      
      dbSubscription = dbSubscriptionResult[0];
      console.log(`Subscription created: ${dbSubscription.id}`);
    }

    // Record payment in database
    console.log(`Recording payment for subscription ${dbSubscription.id}`);
    
    const paymentData = {
      userId: user.id,
      subscriptionId: dbSubscription.id,
      stripePaymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: 'succeeded',
      description: paymentIntent.description || 'One-time payment',
    };
    
    const dbPaymentResult = await paymentStorage.recordPayment(paymentData);
    
    if (!dbPaymentResult || dbPaymentResult.length === 0) {
      console.error('Failed to record payment');
      return res.status(500).json({
        success: false,
        message: 'Failed to record payment'
      });
    }
    
    const dbPayment = dbPaymentResult[0];
    console.log(`Payment recorded: ${dbPayment.id}`);

    // Payment confirmed successfully - include both Stripe and DB data
    const confirmation = {
      success: true,
      paymentIntentId: paymentIntent.id,
      userEmail: userEmail,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      confirmedAt: new Date().toISOString(),
      accessGranted: true,
      subscription: {
        status: 'active',
        planType: 'basic',
        expiresAt: null, // lifetime access
      },
      stripeData: {
        created: paymentIntent.created,
        description: paymentIntent.description,
        receiptEmail: paymentIntent.receipt_email,
      },
      dbSubscription: {
        id: dbSubscription.id,
        status: dbSubscription.status,
        currentPeriodStart: dbSubscription.currentPeriodStart,
        currentPeriodEnd: dbSubscription.currentPeriodEnd,
      },
      dbPayment: {
        id: dbPayment.id,
        amount: dbPayment.amount,
        currency: dbPayment.currency,
        status: dbPayment.status,
      }
    };

    console.log('Payment confirmed and persisted successfully for:', userEmail, 'Amount:', paymentIntent.amount);

    return res.status(200).json(confirmation);

  } catch (error: any) {
    console.error('Payment confirmation error:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment intent ID'
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