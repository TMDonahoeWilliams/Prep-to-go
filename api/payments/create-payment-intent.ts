import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().min(1),
  currency: z.string().min(3),
  userEmail: z.string().email(),
  priceId: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

function safeJson(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS + preflight
  const origin = (req.headers.origin as string) || process.env.APP_BASE_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  if (!req.body) return res.status(400).json({ success: false, message: 'Request body required' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });
  }

  const { amount, currency, userEmail, priceId, firstName, lastName } = parsed.data;

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.error('STRIPE_SECRET_KEY missing');
    return res.status(500).json({ success: false, message: 'Payment provider not configured (missing STRIPE_SECRET_KEY)' });
  }

  // Initialize Stripe client - do not hard-code an API version here.
  // Optionally allow overriding via STRIPE_API_VERSION env var if you want to pin it.
  const stripeOptions: any = {};
  if (process.env.STRIPE_API_VERSION) stripeOptions.apiVersion = process.env.STRIPE_API_VERSION;
  const stripe = new Stripe(stripeSecret, Object.keys(stripeOptions).length ? stripeOptions : undefined);

  // Try to load paymentStorage
  let paymentsModule: any = null;
  try {
    paymentsModule = await import('../../server/payments.js');
  } catch (e1) {
    try {
      paymentsModule = await import('../../server/payments');
    } catch (e2) {
      console.error('Could not import server payments module:', e1, e2);
      return res.status(500).json({ success: false, message: 'Server payments module not available' });
    }
  }
  const paymentStorage = paymentsModule?.paymentStorage ?? paymentsModule?.default ?? paymentsModule;
  if (!paymentStorage) {
    return res.status(500).json({ success: false, message: 'Payment storage not available' });
  }

  // Get or create provisional user
  let user: any = null;
  try {
    const found = await paymentStorage.getUserByEmail?.(userEmail);
    user = Array.isArray(found) ? found[0] : found ?? null;
  } catch (err) {
    console.error('Error fetching user by email:', err);
    // continue to attempt creation
  }

  if (!user) {
    if (typeof paymentStorage.createUser !== 'function') {
      return res.status(500).json({ success: false, message: 'Cannot create provisional user; storage.createUser missing' });
    }
    try {
      const created = await paymentStorage.createUser({
        email: userEmail,
        role: 'student',
        emailVerified: false,
        needsPasswordSetup: true,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        createdAt: new Date().toISOString(),
      });
      user = Array.isArray(created) ? created[0] : created;
      console.log('Provisional user created for payment intent:', user?.id ?? '(no id)');
    } catch (err) {
      console.error('Failed to create provisional user:', err);
      return res.status(500).json({ success: false, message: 'Failed to create provisional user' });
    }
  }

  // Create or reuse Stripe customer (with simple retry on transient errors)
  let customerId = user?.stripeCustomerId ?? user?.stripe_customer_id ?? null;
  if (!customerId) {
    let lastErr: any = null;
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        // persist customer id if storage supports it
        if (typeof paymentStorage.updateUserStripeCustomerId === 'function') {
          try {
            await paymentStorage.updateUserStripeCustomerId(user.id, String(customerId));
          } catch (uErr) {
            console.error('Failed to persist stripe customer id to storage:', uErr);
          }
        }
        break;
      } catch (err: any) {
        lastErr = err;
        console.warn(`Attempt ${attempt} to create Stripe customer failed:`, err?.message ?? err);
        if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 250 * attempt));
      }
    }
    if (!customerId) {
      console.error('Stripe customer creation failed:', safeJson(lastErr));
      return res.status(502).json({
        success: false,
        message: 'Stripe customer creation failed',
        stripeError: lastErr?.message ?? safeJson(lastErr),
      });
    }
  }

  // Create payment intent
  try {
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: { userId: String(user.id), userEmail, priceId },
      receipt_email: userEmail,
      description: `Purchase - ${priceId}`,
    });

    return res.status(200).json({
      success: true,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      paymentIntentStatus: pi.status,
    });
  } catch (err: any) {
    console.error('Failed to create PaymentIntent:', err);
    return res.status(500).json({ success: false, message: 'PaymentIntent creation failed', stripeError: err?.message ?? safeJson(err) });
  }
}
