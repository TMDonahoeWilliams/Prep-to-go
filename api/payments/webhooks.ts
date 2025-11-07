import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import crypto from 'crypto';

// NOTE: adapt the import path to your storage helpers. We dynamically import so Vercel finds the compiled .js.
async function importPaymentStorage() {
  try {
    return await import('../../server/payments.js');
  } catch {
    return await import('../../server/payments');
  }
}

// Placeholder: implement your own email sender (SendGrid, SES, etc.)
async function sendPasswordSetupEmail(toEmail: string, setupUrl: string) {
  // TODO: integrate with your email provider
  console.log(`Send password setup email to ${toEmail}: ${setupUrl}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST and Stripe requires raw body for signature verification. Vercel's req.body may be parsed;
  // with @vercel/node you may need to access raw body differently. Ensure Stripe signature verification is done against raw bytes.
  // If your deployment uses express endpoints (server/routes.ts), apply same logic there.
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  // In Vercel Functions we often don't have raw body available — the Stripe CLI can be used to test locally.
  // If you have access to raw body, use it. Otherwise for hosted express, use express.raw middleware.
  const sig = req.headers['stripe-signature'] as string | undefined;
  const payload = req.body;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });

  let event: Stripe.Event;
  try {
    // If req.body is a string raw payload:
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig || '', stripeSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  try {
    const { paymentStorage } = await importPaymentStorage();

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      const metadata: any = (pi.metadata || {});

      const userEmail: string | undefined = metadata.userEmail || (pi.receipt_email as string | undefined);
      const userIdFromMetadata: string | undefined = metadata.userId;

      // Find or create provisional user in your DB
      let userRecord: any = null;
      if (userIdFromMetadata) {
        const found = await paymentStorage.getUserById(userIdFromMetadata);
        if (Array.isArray(found)) userRecord = found[0];
        else userRecord = found;
      }

      if (!userRecord && userEmail) {
        const found = await paymentStorage.getUserByEmail(userEmail);
        userRecord = Array.isArray(found) ? found[0] : found;
      }

      if (!userRecord) {
        // Create provisional user (no password). Mark needsPasswordSetup=true so they must finalize.
        userRecord = await paymentStorage.createUser({
          email: userEmail || '',
          role: 'student',
          emailVerified: false,
          needsPasswordSetup: true,
          createdAt: new Date().toISOString(),
        });
        console.log('Created provisional user for payment', userRecord?.id || '(no id)');
      }

      // Record payment
      await paymentStorage.recordPayment({
        userId: userRecord?.id ?? null,
        stripePaymentIntentId: pi.id,
        amount: pi.amount ?? 0,
        currency: pi.currency ?? 'usd',
        status: 'succeeded',
        description: pi.description ?? 'Prep-to-go purchase',
        createdAt: new Date().toISOString(),
      });

      // Upsert subscription / grant access
      await paymentStorage.upsertSubscription({
        userId: userRecord.id,
        status: 'active',
        planType: metadata.priceId ?? 'basic',
        stripeSubscriptionId: null,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: null,
      });

      // Mark user paid
      await paymentStorage.updateUserPaidStatus(userRecord.id, {
        hasPaidAccess: true,
        paidAt: new Date().toISOString(),
      });

      // Generate password-setup token (only if user still needs password)
      if (userRecord.needsPasswordSetup) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await paymentStorage.savePasswordSetupToken(userRecord.id, token, expiresAt.toISOString());

        const appBase = process.env.APP_BASE_URL || 'https://yourdomain.com';
        const setupUrl = `${appBase}/complete-setup?token=${token}`;
        await sendPasswordSetupEmail(userRecord.email, setupUrl);
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
