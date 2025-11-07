// snippet to include/replace in your create-payment-intent handler where you currently look up existingUsers
// (adapt variable names to your file)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-11-20.acacia' as any });

let userRecord = null;
const existingUsers = await paymentStorage.getUserByEmail(userEmail);

if (existingUsers.length > 0) {
  userRecord = existingUsers[0];
} else {
  // Create a provisional user so we can attach metadata to the Stripe customer/payment
  // storage.createUser should not require a password here; mark needsPasswordSetup=true
  userRecord = await paymentStorage.createUser({
    email: userEmail,
    role: 'student', // or 'customer' per your domain model
    emailVerified: false,
    needsPasswordSetup: true,
    createdAt: new Date().toISOString(),
  });
  console.log('Created provisional user for payment:', userRecord.id);
}

// Create or fetch Stripe customer with metadata.userId
let customer;
if (userRecord.stripeCustomerId) {
  customer = await stripe.customers.retrieve(userRecord.stripeCustomerId);
} else {
  customer = await stripe.customers.create({
    email: userEmail,
    metadata: { userId: userRecord.id },
  });
  // persist stripe customer id to user
  await paymentStorage.updateUserStripeCustomerId(userRecord.id, String(customer.id));
}

// Create payment intent with metadata.userId
const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency,
  customer: customer.id,
  metadata: {
    userEmail,
    userId: userRecord.id,
    priceId,
  },
  receipt_email: userEmail,
  automatic_payment_methods: { enabled: true },
});
res.json({ clientSecret: paymentIntent.client_secret });
