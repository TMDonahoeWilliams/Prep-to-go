// Stripe configuration
import { loadStripe, Stripe } from '@stripe/stripe-js';

// This is your Stripe publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SLSUHKDh7kqOtmPUDOiEl2YXWhc1uycQVTAe3ckVxNtFaRs6Ym86dKpSexqTTRApVy8ye34d3CigL5qjlvvaQLs00MvKWeUg9';

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
    price: 499, // $4.99 in cents (matching your Stripe price)
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
    productId: 'prod_TI2kbIeqG7nsw6', // Your product ID
    stripePriceId: 'price_1SLSezKDh7kqOtmPtAJVZkSx' // Your actual price ID from Stripe
  }
};

export default getStripe;