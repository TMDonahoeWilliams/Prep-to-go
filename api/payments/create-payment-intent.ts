import type { VercelRequest, VercelResponse } from '@vercel/node';
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
  try {
    // CORS / headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    if (!req.body) return res.status(400).json({ message: 'Request body required' });
    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: 'Validation failed', errors: parse.error.errors });
    }
    const { amount, currency, userEmail, priceId, firstName, lastName } = parse.data;

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error('STRIPE_SECRET_KEY missing');
      return res.status(500).json({ message: 'Payment not configured' });
    }

    // dynamic import storage/payment helper (Vercel-friendly)
    let paymentsModule: any;
    try {
      paymentsModule = await import('../../server/payments.js');
    } catch {
      paymentsModule = await import('../../server/payments');
    }
    const { paymentStorage } = paymentsModule;

    // find or create provisional app user
    let user = null;
    if (paymentStorage && typeof paymentStorage.getUserByEmail === 'function') {
      const found = await paymentStorage.getUserByEmail(userEmail);
      user = Array.isArray(found) ? found[0] : found;
    }

    if (!user) {
      // create a provisional user (no password yet)
      if (!paymentStorage || typeof paymentStorage.createUser !== 'function') {
        return res.status(500).json({ message: 'Payment storage does not support creating users' });
      }
      user = await paymentStorage.createUser({
        email: userEmail,
        role: 'student',
        emailVerified: false,
        needsPasswordSetup: true,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        createdAt: new Date().toISOString(),
      });
      // createUser may return the inserted row or an array - normalize
      user = Array.isArray(user) ? user[0] : user;
      console.log('Created provisional user for payment intent:', user?.id ?? '(no id)');
    }

    // dynamic import Stripe lib
    const StripeLib = (await import('stripe')).default as typeof import('stripe').default;
    const stripe = new StripeLib(stripeSecret, { apiVersion: '2024-11-20' as any });

    // create or fetch stripe customer and persist id on user row
    let customerId = (user && user.stripeCustomerId) || (user && user.stripe_customer_id) || null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      if (paymentStorage && typeof paymentStorage.updateUserStripeCustomerId === 'function') {
        await paymentStorage.updateUserStripeCustomerId(user.id, String(customerId));
      }
    }

    // create payment intent with metadata linking to app user
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userEmail,
        userId: String(user.id),
        priceId,
      },
      receipt_email: userEmail,
      description: 'College Prep Organizer - Lifetime Access',
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (err: any) {
    console.error('create-payment-intent error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
