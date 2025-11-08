import type { VercelRequest, VercelResponse } from '@vercel/node';
import StripeLib from 'stripe';
import { z } from 'zod';

const schema = z.object({
  amount: z.number().min(1),
  currency: z.string().min(3),
  userEmail: z.string().email(),
  priceId: z.string().min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS + preflight support for browser clients
  const origin = (req.headers.origin as string) || process.env.APP_BASE_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  if (!req.body) return res.status(400).json({ success: false, message: 'Request body required' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.errors });

  const { amount, currency, userEmail, priceId, firstName, lastName } = parsed.data;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.error('STRIPE_SECRET_KEY missing');
    return res.status(500).json({ success: false, message: 'Payment provider not configured' });
  }

  // Load paymentStorage module (be tolerant of .js/.ts compiled paths)
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
  const paymentStorage = (paymentsModule?.paymentStorage ?? paymentsModule?.default ?? paymentsModule);

  if (!paymentStorage) {
    return res.status(500).json({ success: false, message: 'Payment storage not available' });
  }

  // Find or create provisional app user
  let user: any = null;
  try {
    const found = await paymentStorage.getUserByEmail?.(userEmail);
    user = Array.isArray(found) ? found[0] : found ?? null;
  } catch (err) {
    console.error('getUserByEmail error', err);
  }

  if (!user) {
    if (typeof paymentStorage.createUser !== 'function') {
      return res.status(500).json({ success: false, message: 'Cannot create provisional user' });
    }
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
    console.log('Provisional user created:', user?.id ?? '(no id)');
  }

  // Create Stripe customer and PaymentIntent
  const stripe = new StripeLib(stripeSecret, { apiVersion: '2024-11-20' as any });

  let customerId = user?.stripeCustomerId ?? user?.stripe_customer_id ?? null;
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: String(user.id) },
      });
      customerId = customer.id;
      if (typeof paymentStorage.updateUserStripeCustomerId === 'function') {
        await paymentStorage.updateUserStripeCustomerId(user.id, String(customerId));
      }
    } catch (err) {
      console.error('Failed to create Stripe customer:', err);
      return res.status(500).json({ success: false, message: 'Stripe customer creation failed' });
    }
  }

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
    });
  } catch (err: any) {
    console.error('create payment intent error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Payment creation failed' });
  }
}
