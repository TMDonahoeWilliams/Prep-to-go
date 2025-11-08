/**
 * server/storage.ts
 *
 * Lazily loads the paymentStorage module from ./payments (Vercel-friendly).
 * This avoids a hard crash at module-evaluation time if ./payments cannot be resolved
 * (e.g., wrong path or not present in the build output).
 *
 * Each exported helper will attempt to import the payments module at call time,
 * normalize the first-row result, and call the underlying paymentStorage functions.
 *
 * If the payments module cannot be loaded, the helpers will throw a clear error
 * that will appear in the function logs instead of crashing the entire import.
 */

type PaymentsModule = { paymentStorage?: any } | null;

let cachedPaymentsModule: PaymentsModule | undefined = undefined;

async function loadPaymentsModule(): Promise<PaymentsModule> {
  if (cachedPaymentsModule !== undefined) return cachedPaymentsModule;
  try {
    // Try the compiled .js path first (Vercel/ts build output)
    const mod = await import('./payments.js');
    cachedPaymentsModule = mod as PaymentsModule;
    return cachedPaymentsModule;
  } catch (errJs) {
    try {
      // Fallback to TypeScript/TS-Node path (dev) or alternate bundling
      const mod = await import('./payments');
      cachedPaymentsModule = mod as PaymentsModule;
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
  if (!mod || !mod.paymentStorage) {
    // Some implementations export default (export default paymentStorage)
    // so check default property too.
    if (mod && (mod.default || (mod as any).paymentStorage)) {
      return (mod as any).default ?? (mod as any).paymentStorage;
    }
    throw new Error(
      'paymentStorage module not available: ensure server/payments.ts exists and exports `paymentStorage` (or default).'
    );
  }
  return mod.paymentStorage;
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

/* Default export (keeps compatibility with `import storage from './storage'`) */
const storage = {
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
