/**
 * storage.ts
 *
 * Provides a stable set of storage helper functions (getUserByEmail, createUser, etc.)
 * that delegate to the paymentStorage implementation in server/payments.ts.
 *
 * This replaces imports that used the '@shared/schema' alias and ensures the runtime
 * can import server/storage directly (relative path), avoiding module resolution errors on Vercel.
 *
 * If you have a different storage module or ORM, adapt these delegates to call into your real data layer.
 */

import paymentStorage from './payments';

async function normalizeFirstRow(result: any) {
  if (!result) return null;
  if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
  return result;
}

export async function getUserByEmail(email: string) {
  if (!paymentStorage || typeof paymentStorage.getUserByEmail !== 'function') {
    throw new Error('storage.getUserByEmail not implemented');
  }
  const res = await paymentStorage.getUserByEmail(email);
  return normalizeFirstRow(res);
}

export async function getUserById(id: string) {
  if (!paymentStorage || typeof paymentStorage.getUserById !== 'function') {
    throw new Error('storage.getUserById not implemented');
  }
  const res = await paymentStorage.getUserById(id);
  return normalizeFirstRow(res);
}

export async function createUser(payload: any) {
  if (!paymentStorage || typeof paymentStorage.createUser !== 'function') {
    throw new Error('storage.createUser not implemented');
  }
  const res = await paymentStorage.createUser(payload);
  return normalizeFirstRow(res);
}

export async function updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
  if (!paymentStorage || typeof paymentStorage.updateUserStripeCustomerId !== 'function') {
    throw new Error('storage.updateUserStripeCustomerId not implemented');
  }
  return await paymentStorage.updateUserStripeCustomerId(userId, stripeCustomerId);
}

export async function linkSupabaseUser(userId: string, supabaseUserId: string | null) {
  if (!paymentStorage || typeof paymentStorage.linkSupabaseUser !== 'function') {
    throw new Error('storage.linkSupabaseUser not implemented');
  }
  return await paymentStorage.linkSupabaseUser(userId, supabaseUserId);
}

export async function updateUserPaidStatus(userId: string, data: any) {
  if (!paymentStorage || typeof paymentStorage.updateUserPaidStatus !== 'function') {
    throw new Error('storage.updateUserPaidStatus not implemented');
  }
  return await paymentStorage.updateUserPaidStatus(userId, data);
}

export async function setUserPasswordHash(userId: string, hash: string) {
  if (!paymentStorage || typeof paymentStorage.setUserPasswordHash !== 'function') {
    throw new Error('storage.setUserPasswordHash not implemented');
  }
  return await paymentStorage.setUserPasswordHash(userId, hash);
}

export async function savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
  if (!paymentStorage || typeof paymentStorage.savePasswordSetupToken !== 'function') {
    throw new Error('storage.savePasswordSetupToken not implemented');
  }
  return await paymentStorage.savePasswordSetupToken(userId, token, expiresAt);
}

export async function findPasswordSetupByToken(token: string) {
  if (!paymentStorage || typeof paymentStorage.findPasswordSetupByToken !== 'function') {
    throw new Error('storage.findPasswordSetupByToken not implemented');
  }
  const res = await paymentStorage.findPasswordSetupByToken(token);
  return normalizeFirstRow(res);
}

export async function clearPasswordSetupToken(userId: string) {
  if (!paymentStorage || typeof paymentStorage.clearPasswordSetupToken !== 'function') {
    throw new Error('storage.clearPasswordSetupToken not implemented');
  }
  return await paymentStorage.clearPasswordSetupToken(userId);
}

// Payments/subscriptions delegation
export async function recordPayment(paymentData: any) {
  if (!paymentStorage || typeof paymentStorage.recordPayment !== 'function') {
    throw new Error('storage.recordPayment not implemented');
  }
  return await paymentStorage.recordPayment(paymentData);
}

export async function upsertSubscription(sub: any) {
  if (!paymentStorage || typeof paymentStorage.upsertSubscription !== 'function') {
    throw new Error('storage.upsertSubscription not implemented');
  }
  return await paymentStorage.upsertSubscription(sub);
}

export default {
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
