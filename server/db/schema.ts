// Minimal placeholder schema to satisfy imports during build.
// Replace these with your real ORM schema/table definitions (Drizzle/Prisma/etc.)
// or re-export your actual schema implementation.

export const users = {
  id: 'id',
  email: 'email',
  password_hash: 'password_hash',
  stripe_customer_id: 'stripe_customer_id',
  password_setup_token: 'password_setup_token',
  password_setup_token_expires_at: 'password_setup_token_expires_at',
  needs_password_setup: 'needs_password_setup',
  first_name: 'first_name',
  last_name: 'last_name',
  has_paid_access: 'has_paid_access',
  paid_at: 'paid_at',
  supabase_user_id: 'supabase_user_id',
  created_at: 'created_at',
};

export const payments = {
  id: 'id',
  user_id: 'user_id',
  stripe_payment_intent_id: 'stripe_payment_intent_id',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  description: 'description',
  created_at: 'created_at',
};

export const subscriptions = {
  id: 'id',
  user_id: 'user_id',
  status: 'status',
  plan_type: 'plan_type',
  stripe_subscription_id: 'stripe_subscription_id',
  current_period_start: 'current_period_start',
  current_period_end: 'current_period_end',
  cancel_at_period_end: 'cancel_at_period_end',
  created_at: 'created_at',
};

// No-op condition helpers — these are placeholders. Replace with ORM-specific helpers.
export function eq(/* column: any, value: any */) {
  return null as any;
}
export function and(...args: any[]) {
  return null as any;
}
