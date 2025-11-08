/**
 * server/storage.ts
 *
 * Lazily loads the paymentStorage module from ./payments (Vercel-friendly).
 * Exports both a named `storage` object and a default export so existing
 * import sites that use `import { storage } from './storage'` continue to work.
 *
 * Each exported helper dynamically imports ./payments(.js) and delegates to the
 * underlying paymentStorage implementation. If the payments module cannot be loaded,
 * the helpers throw a clear error that will appear in function logs.
 */

type PaymentsModule = { paymentStorage?: any } | null;

let cachedPaymentsModule: PaymentsModule | undefined = undefined;

async function loadPaymentsModule(): Promise<PaymentsModule> {
  if (cachedPaymentsModule !== undefined) return cachedPaymentsModule;
  try {
    const mod = await import('./payments.js');
    cachedPaymentsModule = (mod as PaymentsModule) || null;
    return cachedPaymentsModule;
  } catch (errJs) {
    try {
      const mod = await import('./payments');
      cachedPaymentsModule = (mod as PaymentsModule) || null;
      return cachedPaymentsModule;
    } catch (errFallback) {
      console.error('Could not import server payments module:', errJs, errFallback);
      cachedPaymentsModule = null;
      return null;
    }
  }
}

function normalizeFirstRow(result: any) {
  if (!result) return null;
  if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
  return result;
}

async function getPaymentStorage(): Promise<any> {
  const mod = await loadPaymentsModule();
  if (!mod) {
    throw new Error(
      'paymentStorage module not available: ensure server/payments.ts exists and exports `paymentStorage` (or default export).'
    );
  }
  // Accept either { paymentStorage } or default export
  const ps = (mod as any).paymentStorage ?? (mod as any).default;
  if (!ps) {
    throw new Error('paymentStorage export not found on server/payments module');
  }
  return ps;
}

/* ----- Exported helpers that delegate to paymentStorage ----- */

export async function getUserByEmail(email: string) {
  const ps = await getPaymentStorage();
  const res = await ps.getUserByEmail(email);
  return normalizeFirstRow(res);
}

export async function getUserById(id: string) {
  const ps = await getPaymentStorage();
  const res = await ps.getUserById(id);
  return normalizeFirstRow(res);
}

export async function createUser(payload: any) {
  const ps = await getPaymentStorage();
  const res = await ps.createUser(payload);
  return normalizeFirstRow(res);
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  const ps = await getPaymentStorage();
  return await ps.updateUserStripeCustomerId(userId, stripeCustomerId);
}

export async function linkSupabaseUser(userId: string, supabaseUserId: string | null) {
  const ps = await getPaymentStorage();
  return await ps.linkSupabaseUser(userId, supabaseUserId);
}

export async function updateUserPaidStatus(userId: string, data: any) {
  const ps = await getPaymentStorage();
  return await ps.updateUserPaidStatus(userId, data);
}

export async function setUserPasswordHash(userId: string, hash: string) {
  const ps = await getPaymentStorage();
  return await ps.setUserPasswordHash(userId, hash);
}

export async function savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
  const ps = await getPaymentStorage();
  return await ps.savePasswordSetupToken(userId, token, expiresAt);
}

export async function findPasswordSetupByToken(token: string) {
  const ps = await getPaymentStorage();
  const res = await ps.findPasswordSetupByToken(token);
  return normalizeFirstRow(res);
}

export async function clearPasswordSetupToken(userId: string) {
  const ps = await getPaymentStorage();
  return await ps.clearPasswordSetupToken(userId);
}

export async function recordPayment(paymentData: any) {
  const ps = await getPaymentStorage();
  return await ps.recordPayment(paymentData);
}

export async function upsertSubscription(sub: any) {
  const ps = await getPaymentStorage();
  return await ps.upsertSubscription(sub);
}

/* ----- Provide both named `storage` and default export for compatibility ----- */

export const storage = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserStripeCustomerId,
  linkSupabaseUser,
  updateUserPaidStatus,
  setUserPasswordHash,
  savePasswordSetupToken,
  findPasswordSetupByToken,
  clearPasswordSetupToken,
  recordPayment,
  upsertSubscription,
};

export default storage;
