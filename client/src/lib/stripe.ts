// client/src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Publishable key (Vite)
const stripePublishableKey = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || '';

// Lazy Stripe loader
let stripePromise: Promise<Stripe | null> | undefined;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
}
export default getStripe;

// Pricing configuration (exported as a named export)
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
    productId: (import.meta.env.VITE_STRIPE_PRODUCT_ID as string) || '',
    stripePriceId: (import.meta.env.VITE_STRIPE_PRICE_ID as string) || ''
  }
} as const;
