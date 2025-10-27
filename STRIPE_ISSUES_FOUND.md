# Stripe Payment Setup - Critical Issues & Fixes

## 🚨 **URGENT: Security Issue**
Your `.env` file contains **LIVE Stripe keys** which should never be used in development!

## ✅ **Step 1: Switch to Test Keys (IMMEDIATE)**

Replace your current Stripe keys with test keys for development:

```bash
# DEVELOPMENT - Use test keys (safe)
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key
```

## ✅ **Step 2: Create Products & Prices in Stripe**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Create a new Product:
   - Name: "College Prep Organizer"
   - Description: "Complete access to college preparation tools"
3. Add a Price:
   - Amount: $4.99
   - Currency: USD
   - Type: One-time payment
4. Copy the Price ID (starts with `price_`) and add to .env:
   ```bash
   VITE_STRIPE_PRICE_ID=price_your_actual_price_id
   VITE_STRIPE_PRODUCT_ID=prod_your_actual_product_id
   ```

## ✅ **Step 3: Fix Payment Intent API**

The current API only simulates payments. It needs real Stripe integration.

## ✅ **Step 4: Set Up Webhooks**

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://localhost:5000/api/payments/webhook` (for development)
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret and update:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

## 🔧 **Step 5: Test Payment Flow**

1. Use test card: `4242 4242 4242 4242`
2. Any expiry date in the future
3. Any CVC (e.g., 123)

## 🚨 **PRODUCTION SETUP**

When deploying to production:
1. Switch to live keys (`sk_live_`, `pk_live_`)
2. Update webhook endpoint to production URL
3. Test with small amounts first
4. Enable fraud detection

## 📋 **Current Status**

- ❌ Using live keys in development (SECURITY RISK)
- ❌ Payment APIs only simulate (no real Stripe calls)
- ❌ Missing Product/Price IDs
- ❌ Webhook secret not configured
- ✅ UI components properly implemented
- ✅ Database schema ready
- ✅ Error handling in place

## 🎯 **Next Steps**

1. **IMMEDIATELY** switch to test keys
2. Create products in Stripe Dashboard
3. Update payment APIs with real Stripe integration
4. Test complete payment flow
5. Set up webhooks for automatic status updates