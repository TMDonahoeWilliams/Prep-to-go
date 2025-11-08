import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import crypto from 'crypto';

// Simple email sender stub — replace with SendGrid/SES implementation
async function sendPasswordSetupEmail(toEmail: string, setupUrl: string) {
  console.log(`Send password setup email to ${toEmail}: ${setupUrl}`);
  // TODO: integrate real email provider here
}

function rawBodyFromRequest(req: VercelRequest) {
  // Vercel sometimes provides parsed body; Stripe expects raw payload for signature verification.
  if (typeof req.body === 'string') return req.body;
  try {
    return JSON.stringify(req.body);
  } catch {
    return '';
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).send('Webhook not configured');
  }

  // Dynamic import paymentStorage and Stripe
  let paymentsModule: any;
  try {
    paymentsModule = await import('../../server/payments.js');
  } catch {
    paymentsModule = await import('../../server/payments');
  }
  const { paymentStorage } = paymentsModule;

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.error('STRIPE_SECRET_KEY not set');
    return res.status(500).send('Stripe not configured');
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-11-20' as any });

  const sig = (req.headers['stripe-signature'] || '') as string;
  const rawBody = rawBodyFromRequest(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
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

      // Find user by metadata.userId or email
      let user = null;
      if (userIdMeta && paymentStorage.getUserById) {
        const found = await paymentStorage.getUserById(userIdMeta);
        user = Array.isArray(found) ? found[0] : found;
      }
      if (!user && userEmail && paymentStorage.getUserByEmail) {
        const found = await paymentStorage.getUserByEmail(userEmail);
        user = Array.isArray(found) ? found[0] : found;
      }

      if (!user) {
        // Create provisional user as fallback
        if (paymentStorage.createUser) {
          user = await paymentStorage.createUser({
            email: userEmail || '',
            role: 'student',
            emailVerified: false,
            needsPasswordSetup: true,
            createdAt: new Date().toISOString(),
          });
          user = Array.isArray(user) ? user[0] : user;
          console.log('Webhook: created provisional user', user?.id);
        } else {
          console.warn('Webhook: no storage.createUser available; skipping user creation');
        }
      }

      // Record payment
      if (paymentStorage.recordPayment) {
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
      if (paymentStorage.upsertSubscription) {
        await paymentStorage.upsertSubscription({
          userId: user.id,
          status: 'active',
          planType: metadata.priceId ?? 'lifetime',
          stripeSubscriptionId: null,
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: null,
        });
      }

      // Mark user as paid
      if (paymentStorage.updateUserPaidStatus) {
        await paymentStorage.updateUserPaidStatus(user.id, {
          hasPaidAccess: true,
          paidAt: new Date().toISOString(),
        });
      }

      // Save password-setup token and email user
      if (user && paymentStorage.savePasswordSetupToken) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await paymentStorage.savePasswordSetupToken(user.id, token, expiresAt.toISOString());

        const appBase = process.env.APP_BASE_URL || 'https://your-app.example.com';
        const setupUrl = `${appBase}/complete-setup?token=${token}`;
        await sendPasswordSetupEmail(user.email, setupUrl);
      }

      return res.status(200).send('ok');
    }

    // handle other event types as needed
    return res.status(200).send('ignored');
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).send('Internal error');
  }
}
