// This is the logic you should run when receiving payment_intent.succeeded
// (integrate into your existing webhook handler in server/routes.ts or api/payments/webhook)
import crypto from 'crypto';
import { sendPasswordSetupEmail } from './emails'; // implement an email helper

// event is Stripe.Event parsed and verified already
if (event.type === 'payment_intent.succeeded') {
  const pi = event.data.object as Stripe.PaymentIntent;
  const metadata = (pi.metadata || {}) as any;
  const userId = metadata.userId;
  const userEmail = metadata.userEmail;

  // Prefer userId, else try email lookup
  let users = userId ? await paymentStorage.getUserById(userId) : await paymentStorage.getUserByEmail(userEmail);
  let user = Array.isArray(users) ? users[0] : users;

  if (!user) {
    // Optionally create user now (but prefer provisional creation at intent time)
    user = await paymentStorage.createUser({
      email: userEmail,
      role: 'student',
      emailVerified: false,
      needsPasswordSetup: true,
      createdAt: new Date().toISOString(),
    });
  }

  // Record the payment
  await paymentStorage.recordPayment({
    userId: user.id,
    stripePaymentIntentId: pi.id,
    amount: pi.amount ?? 0,
    currency: pi.currency ?? 'usd',
    status: 'succeeded',
    description: pi.description ?? 'Prep-to-go purchase',
    createdAt: new Date().toISOString(),
  });

  // Upsert subscription / grant access
  await paymentStorage.upsertSubscription({
    userId: user.id,
    status: 'active',
    planType: metadata.priceId ?? 'basic',
    stripeSubscriptionId: null,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: null,
  });

  // Mark user as paid
  await paymentStorage.updateUserPaidStatus(user.id, {
    hasPaidAccess: true,
    paidAt: new Date().toISOString(),
    emailVerified: !!user.emailVerified, // keep as-is
  });

  // Generate password-setup token and send email (if user needs setup)
  if (user.needsPasswordSetup) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await paymentStorage.savePasswordSetupToken(user.id, token, expiresAt.toISOString());

    const setupUrl = `${process.env.APP_BASE_URL || 'https://yourdomain.com'}/complete-setup?token=${token}`;
    await sendPasswordSetupEmail(user.email, setupUrl);
  }

  // Response: return 200 to Stripe
  res.status(200).send('ok');
}
