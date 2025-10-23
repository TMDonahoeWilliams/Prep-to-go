// Stripe configuration
import { loadStripe, Stripe } from '@stripe/stripe-js';

// This is your Stripe publishable key - only use environment variable
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Pricing configuration
export const PRICING_PLANS = {
  BASIC: {
    name: 'Prep-to-go Planner',
    price: 499, // $4.99 in cents
    currency: 'usd',
    interval: 'one-time',
    description: 'Complete access to the College Prep Organizer',
    features: [
      'Comprehensive task management',
      'Document tracking system',
      'Progress monitoring',
      'Calendar integration',
      'Parent/student collaboration',
      'Deadline reminders',
      'College application tracking',
      'Financial aid organization'
    ],
    productId: import.meta.env.VITE_STRIPE_PRODUCT_ID,
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_ID
  }
};

export default getStripe;