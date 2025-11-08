import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import crypto from 'crypto';

// Replace with real email provider implementation for production
async function sendPasswordSetupEmail(toEmail: string, setupUrl: string) {
  console.log(`(stub) send password setup email to ${toEmail}: ${setupUrl}`);
  // integrate SendGrid, SES, etc. here
}

// Read raw body for Stripe signature verification
function rawBodyFromRequest(req: VercelRequest) {
  if (typeof req.body === 'string') return req.body;
  try {
    // Vercel may parse; reconstruct raw body
    return JSON.stringify(req.body);
  } catch {
    return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    console.error('Stripe env missing');
    return res.status(500).send('Stripe not configured');
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20' as any });

  // Load paymentStorage
  let paymentsModule: any = null;
  try {
    paymentsModule = await import('../../server/payments.js');
  } catch (e1) {
    try {
      paymentsModule = await import('../../server/payments');
    } catch (e2) {
      console.error('Could not import server payments module:', e1, e2);
      return res.status(500).send('Server storage not available');
    }
  }
  const paymentStorage = paymentsModule?.paymentStorage ?? paymentsModule?.default ?? paymentsModule;
  if (!paymentStorage) {
    console.error('paymentStorage not found');
    return res.status(500).send('Server storage not available');
  }

  const sig = (req.headers['stripe-signature'] || '') as string;
  const rawBody = rawBodyFromRequest(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const metadata: any = pi.metadata || {};
      const userIdMeta = metadata.userId;
      const userEmail = metadata.userEmail || (pi.receipt_email as string | undefined);

      // Find or create user
      let user: any = null;
      if (userIdMeta && typeof paymentStorage.getUserById === 'function') {
        const found = await paymentStorage.getUserById(userIdMeta);
        user = Array.isArray(found) ? found[0] : found;
      }
      if (!user && userEmail && typeof paymentStorage.getUserByEmail === 'function') {
        const found = await paymentStorage.getUserByEmail(userEmail);
        user = Array.isArray(found) ? found[0] : found;
      }

      if (!user) {
        if (typeof paymentStorage.createUser === 'function') {
          const created = await paymentStorage.createUser({
            email: userEmail ?? '',
            role: 'student',
            emailVerified: false,
            needsPasswordSetup: true,
            createdAt: new Date().toISOString(),
          });
          user = Array.isArray(created) ? created[0] : created;
          console.log('Webhook: created provisional user', user?.id);
        } else {
          console.warn('Webhook cannot create user; storage.createUser missing');
        }
      }

      // Record payment
      if (typeof paymentStorage.recordPayment === 'function') {
        await paymentStorage.recordPayment({
          userId: user?.id ?? null,
          stripePaymentIntentId: pi.id,
          amount: pi.amount ?? 0,
          currency: pi.currency ?? 'usd',
          status: 'succeeded',
          description: pi.description ?? null,
          createdAt: new Date().toISOString(),
        });
      }

      // Upsert subscription / grant access
      if (typeof paymentStorage.upsertSubscription === 'function' && user) {
        await paymentStorage.upsertSubscription({
          userId: user.id,
          status: 'active',
          planType: metadata.priceId ?? 'lifetime',
          stripeSubscriptionId: null,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: null,
        });
      }

      if (typeof paymentStorage.updateUserPaidStatus === 'function' && user) {
        await paymentStorage.updateUserPaidStatus(user.id, {
          hasPaidAccess: true,
          paidAt: new Date().toISOString(),
        });
      }

      // Save password-setup token and email user
      if (user && typeof paymentStorage.savePasswordSetupToken === 'function') {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await paymentStorage.savePasswordSetupToken(user.id, token, expiresAt.toISOString());

        const appBase = process.env.APP_BASE_URL || 'https://your-app.example.com';
        const setupUrl = `${appBase}/complete-setup?token=${token}`;
        await sendPasswordSetupEmail(user.email, setupUrl);
      }
    }

    // Respond to all events
    return res.status(200).send('ok');
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).send('Internal error');
  }
}
