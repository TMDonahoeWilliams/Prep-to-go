import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Supabase "Customize Access Token (JWT) claims" hook
 *
 * - Supabase will POST user info to this URL when issuing access tokens.
 * - This handler reads the incoming payload (sub/email etc.), queries your
 *   payment/subscription state via server/payments, and returns a small
 *   namespaced claims object to be embedded into the access token.
 *
 * Response shape:
 *   { "claims": { "<namespaced-key>": <value>, ... } }
 *
 * Security:
 * - If CLAIMS_HOOK_SECRET is set in env, the request must include the header
 *   "x-claims-hook-secret" with the same value. This mitigates unauthorized calls.
 *
 * Notes:
 * - Keep claims small (booleans/short strings). Use a URL namespace for keys.
 * - The handler returns HTTP 200 and an empty claims object on error so token
 *   issuance is not blocked.
 */

const NAMESPACE = 'https://collegeprep.example.com/';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ claims: {} });
  }

  // Optional shared secret check
  const expectedSecret = process.env.CLAIMS_HOOK_SECRET;
  if (expectedSecret) {
    const provided = (req.headers['x-claims-hook-secret'] || '') as string;
    if (!provided || provided !== expectedSecret) {
      console.warn('jwt-claims: invalid or missing hook secret');
      return res.status(403).json({ claims: {} });
    }
  }

  const payload = req.body || {};
  // Typical Supabase hook provides sub (user id), email and other metadata.
  const userId = payload.sub || payload.user_id || payload.id || null;
  const email = payload.email || null;

  // Default safe empty claims
  const claims: Record<string, any> = {};

  try {
    // Dynamically import the payments/paymentStorage module so builds that don't include it won't fail import-time.
    let paymentsModule: any = null;
    try {
      paymentsModule = await import('../../../server/payments.js');
    } catch (e1) {
      try {
        paymentsModule = await import('../../../server/payments');
      } catch (e2) {
        console.error('jwt-claims: could not import server/payments:', e1, e2);
        // Return empty claims (do not block token issuance)
        return res.status(200).json({ claims: {} });
      }
    }
    const paymentStorage = paymentsModule?.paymentStorage ?? paymentsModule?.default ?? paymentsModule;
    if (!paymentStorage) {
      console.error('jwt-claims: paymentStorage not found');
      return res.status(200).json({ claims: {} });
    }

    // Resolve user record (prefer by id, fall back to email)
    let user: any = null;
    if (userId && typeof paymentStorage.getUserById === 'function') {
      try {
        const found = await paymentStorage.getUserById(userId);
        user = Array.isArray(found) ? found[0] : found ?? null;
      } catch (err) {
        console.warn('jwt-claims: getUserById error', err);
      }
    }
    if (!user && email && typeof paymentStorage.getUserByEmail === 'function') {
      try {
        const found = await paymentStorage.getUserByEmail(email);
        user = Array.isArray(found) ? found[0] : found ?? null;
      } catch (err) {
        console.warn('jwt-claims: getUserByEmail error', err);
      }
    }

    // Determine paid status and subscription info using storage helpers if available
    let hasPaid = false;
    let planType: string | null = null;
    let expiresAt: string | null = null;

    if (user) {
      const uid = user.id ?? user.userId ?? user.user_id ?? String(userId ?? '');
      if (uid && typeof paymentStorage.hasUserPaidAccess === 'function') {
        try {
          const paid = await paymentStorage.hasUserPaidAccess(uid);
          // storage helper may return boolean or truthy value
          hasPaid = !!paid;
        } catch (err) {
          console.warn('jwt-claims: hasUserPaidAccess error', err);
        }
      }

      // Try to infer plan and expiry from subscription record if helper exists
      if (uid && typeof paymentStorage.getUserSubscription === 'function') {
        try {
          const subs = await paymentStorage.getUserSubscription(uid);
          const sub = Array.isArray(subs) ? subs[0] : subs ?? null;
          if (sub) {
            planType = sub.plan_type ?? sub.planType ?? null;
            // Accept several possible timestamp fields
            expiresAt = sub.current_period_end ?? sub.currentPeriodEnd ?? sub.expires_at ?? null;
            if (expiresAt && expiresAt instanceof Date) expiresAt = expiresAt.toISOString();
          }
        } catch (err) {
          console.warn('jwt-claims: getUserSubscription error', err);
        }
      }

      // Fallback: check users table fields if helpers above are not present
      if (!planType && (user.planType || user.plan_type)) {
        planType = user.planType ?? user.plan_type ?? null;
      }
      if (!expiresAt && (user.subscription_expires_at || user.expires_at || user.current_period_end)) {
        const maybe = user.subscription_expires_at ?? user.expires_at ?? user.current_period_end;
        expiresAt = maybe ? (new Date(maybe)).toISOString() : null;
      }

      // As final fallback, check a direct user flag
      if (!hasPaid && (typeof user.has_paid_access !== 'undefined' || typeof user.hasPaidAccess !== 'undefined')) {
        hasPaid = !!(user.has_paid_access ?? user.hasPaidAccess);
      }
    }

    // Populate namespaced claims (use URL keys to avoid collisions)
    claims[`${NAMESPACE}has_paid`] = hasPaid;
    if (planType !== null) claims[`${NAMESPACE}plan`] = planType;
    if (expiresAt !== null) claims[`${NAMESPACE}expires_at`] = expiresAt;
  } catch (err: any) {
    console.error('jwt-claims: unexpected error', err);
    // On error, return empty claims to avoid blocking token issuance
    return res.status(200).json({ claims: {} });
  }

  // Return claims object expected by Supabase
  return res.status(200).json({ claims });
}
