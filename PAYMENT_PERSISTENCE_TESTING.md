# Payment Persistence Testing Instructions

## Overview
This document provides manual testing instructions for the payment persistence feature implemented in `api/payments/confirm-payment.ts` and `api/payments/check-access.ts`.

## Prerequisites
1. Stripe account with test API keys configured
2. PostgreSQL database configured with proper schema (subscriptions, payments, users tables)
3. Valid user account in the database with an email address
4. Environment variables set:
   - `DATABASE_URL` - PostgreSQL connection string
   - `STRIPE_SECRET_KEY` - Stripe secret key

## Test Scenario 1: First-time Payment Confirmation

### Setup
1. Ensure the user exists in the database:
   ```sql
   SELECT id, email FROM users WHERE email = 'test@example.com';
   ```

2. Create a test payment intent in Stripe (using Stripe CLI or dashboard)
   - Set metadata: `userEmail: test@example.com`
   - Use test card: 4242 4242 4242 4242

### Test Steps

1. **Confirm the payment through the API:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/payments/confirm-payment \
     -H "Content-Type: application/json" \
     -d '{
       "paymentIntentId": "pi_xxxxxxxxxxxxx",
       "userEmail": "test@example.com"
     }'
   ```

2. **Expected Response:**
   ```json
   {
     "success": true,
     "paymentIntentId": "pi_xxxxxxxxxxxxx",
     "userEmail": "test@example.com",
     "amount": 4999,
     "currency": "usd",
     "status": "succeeded",
     "confirmedAt": "2024-11-07T12:00:00.000Z",
     "accessGranted": true,
     "subscription": {
       "status": "active",
       "planType": "basic",
       "expiresAt": null
     },
     "stripeData": {
       "created": 1699362000,
       "description": "College Prep Organizer - Lifetime Access",
       "receiptEmail": "test@example.com"
     },
     "dbSubscription": {
       "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
       "status": "active",
       "currentPeriodStart": "2024-11-07T12:00:00.000Z",
       "currentPeriodEnd": null
     },
     "dbPayment": {
       "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
       "amount": 4999,
       "currency": "usd",
       "status": "succeeded"
     }
   }
   ```

3. **Verify Database Records:**
   
   Check subscription was created:
   ```sql
   SELECT * FROM subscriptions 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
   AND status = 'active';
   ```
   
   Expected fields:
   - `status` = 'active'
   - `stripe_subscription_id` = NULL (for one-time payments)
   - `current_period_start` = timestamp
   - `current_period_end` = NULL (lifetime access)
   
   Check payment was recorded:
   ```sql
   SELECT * FROM payments 
   WHERE stripe_payment_intent_id = 'pi_xxxxxxxxxxxxx';
   ```
   
   Expected fields:
   - `user_id` = user's ID
   - `subscription_id` = subscription ID from above
   - `amount` = 4999 (or test amount)
   - `currency` = 'usd'
   - `status` = 'succeeded'

4. **Check Server Logs:**
   Look for these log messages in order:
   ```
   Payment confirmation requested: {...}
   Confirming payment for test@example.com with intent pi_xxxxxxxxxxxxx
   Looking up user by email: test@example.com
   User found: <user-id> (test@example.com)
   Creating subscription for user <user-id>
   Subscription created: <subscription-id>
   Recording payment for subscription <subscription-id>
   Payment recorded: <payment-id>
   Payment confirmed and persisted successfully for: test@example.com Amount: 4999
   ```

## Test Scenario 2: Check Access After Payment

### Test Steps

1. **Check access status via API:**
   ```bash
   curl -X GET "https://your-app.vercel.app/api/payments/check-access?email=test@example.com"
   ```
   
   OR with POST:
   ```bash
   curl -X POST https://your-app.vercel.app/api/payments/check-access \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Expected Response:**
   ```json
   {
     "hasPaidAccess": true,
     "subscriptionStatus": "active",
     "planType": "basic",
     "expiresAt": null,
     "trialEndsAt": null,
     "message": "Active subscription found"
   }
   ```

3. **Verify Server Logs:**
   ```
   Payment access check requested for: test@example.com
   Returning payment status: { hasPaidAccess: true, ... }
   ```

## Test Scenario 3: Duplicate Payment Prevention

### Test Steps

1. **Attempt second payment for same user:**
   - Create a new payment intent in Stripe
   - Confirm it using the same user email

2. **Expected Behavior:**
   - API should return success
   - Should reuse existing subscription (check logs for "User already has active subscription")
   - Should create a new payment record
   - Both payments should reference the same subscription

3. **Verify Database:**
   ```sql
   -- Should have 1 subscription
   SELECT COUNT(*) FROM subscriptions 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com')
   AND status = 'active';
   
   -- Should have 2 payments
   SELECT COUNT(*) FROM payments 
   WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
   ```

## Test Scenario 4: Error Cases

### 4.1 User Not Found

**Request:**
```bash
curl -X POST https://your-app.vercel.app/api/payments/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_xxxxxxxxxxxxx",
    "userEmail": "nonexistent@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "User not found. Please register first."
}
```

### 4.2 Invalid Payment Intent

**Request:**
```bash
curl -X POST https://your-app.vercel.app/api/payments/confirm-payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_invalid",
    "userEmail": "test@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Invalid payment intent ID"
}
```

### 4.3 Payment Not Succeeded

Create a payment intent that hasn't been completed yet.

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Payment not completed. Status: requires_payment_method",
  "status": "requires_payment_method"
}
```

### 4.4 Check Access - No Email

**Request:**
```bash
curl -X GET https://your-app.vercel.app/api/payments/check-access
```

**Expected Response (200):**
```json
{
  "hasPaidAccess": false,
  "subscriptionStatus": "inactive",
  "planType": null,
  "expiresAt": null,
  "trialEndsAt": null,
  "message": "Email required to check payment status"
}
```

### 4.5 Check Access - User Without Subscription

**Request:**
```bash
curl -X GET "https://your-app.vercel.app/api/payments/check-access?email=nosubscription@example.com"
```

**Expected Response (200):**
```json
{
  "hasPaidAccess": false,
  "subscriptionStatus": "inactive",
  "planType": null,
  "expiresAt": null,
  "trialEndsAt": null,
  "message": "No active subscription"
}
```

## Verification Checklist

After completing all test scenarios, verify:

- [ ] Payment confirmation creates subscription record in database
- [ ] Payment confirmation creates payment record in database
- [ ] Subscription has correct status ('active')
- [ ] Subscription has null currentPeriodEnd (lifetime access)
- [ ] Payment record links to subscription via subscriptionId
- [ ] Payment record contains Stripe payment intent ID
- [ ] Check-access returns true for users with active subscriptions
- [ ] Check-access returns false for users without subscriptions
- [ ] Duplicate payments reuse existing subscription
- [ ] All error cases return appropriate status codes and messages
- [ ] Server logs show detailed information at each step
- [ ] No sensitive data is exposed in responses

## Database Cleanup

After testing, clean up test data:
```sql
-- Delete test payments
DELETE FROM payments WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Delete test subscriptions
DELETE FROM subscriptions WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- Optionally delete test user
DELETE FROM users WHERE email = 'test@example.com';
```

## Notes

- All times are stored in UTC
- Payment amounts are in cents (4999 = $49.99)
- The subscription record uses NULL for stripeSubscriptionId since these are one-time payments
- The API maintains backward compatibility - existing client code expecting the old response format will still work
