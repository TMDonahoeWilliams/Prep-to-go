/**
 * storage.ts
 *
 * Delegates to paymentStorage in server/payments.ts while exporting both a default export
 * and a named export `storage` to match existing import sites that use:
 *   import { storage } from './storage';
 *
 * This file intentionally keeps the same function names as before but exposes them
 * via a single object so both `import storage from './storage'` and
 * `import { storage } from './storage'` work.
 */

import paymentStorage from './payments';

async function normalizeFirstRow(result: any) {
  if (!result) return null;
  if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
  return result;
}

const impl = {
  // ----- Users -----
  async getUserByEmail(email: string) {
    if (!paymentStorage || typeof paymentStorage.getUserByEmail !== 'function') {
      throw new Error('storage.getUserByEmail not implemented');
    }
    const res = await paymentStorage.getUserByEmail(email);
    return normalizeFirstRow(res);
  },

  async getUserById(id: string) {
    if (!paymentStorage || typeof paymentStorage.getUserById !== 'function') {
      throw new Error('storage.getUserById not implemented');
    }
    const res = await paymentStorage.getUserById(id);
    return normalizeFirstRow(res);
  },

  async createUser(payload: any) {
    if (!paymentStorage || typeof paymentStorage.createUser !== 'function') {
      throw new Error('storage.createUser not implemented');
    }
    const res = await paymentStorage.createUser(payload);
    return normalizeFirstRow(res);
  },

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    if (!paymentStorage || typeof paymentStorage.updateUserStripeCustomerId !== 'function') {
      throw new Error('storage.updateUserStripeCustomerId not implemented');
    }
    return await paymentStorage.updateUserStripeCustomerId(userId, stripeCustomerId);
  },

  async linkSupabaseUser(userId: string, supabaseUserId: string | null) {
    if (!paymentStorage || typeof paymentStorage.linkSupabaseUser !== 'function') {
      throw new Error('storage.linkSupabaseUser not implemented');
    }
    return await paymentStorage.linkSupabaseUser(userId, supabaseUserId);
  },

  async updateUserPaidStatus(userId: string, data: any) {
    if (!paymentStorage || typeof paymentStorage.updateUserPaidStatus !== 'function') {
      throw new Error('storage.updateUserPaidStatus not implemented');
    }
    return await paymentStorage.updateUserPaidStatus(userId, data);
  },

  async setUserPasswordHash(userId: string, hash: string) {
    if (!paymentStorage || typeof paymentStorage.setUserPasswordHash !== 'function') {
      throw new Error('storage.setUserPasswordHash not implemented');
    }
    return await paymentStorage.setUserPasswordHash(userId, hash);
  },

  // ----- Password setup token -----
  async savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
    if (!paymentStorage || typeof paymentStorage.savePasswordSetupToken !== 'function') {
      throw new Error('storage.savePasswordSetupToken not implemented');
    }
    return await paymentStorage.savePasswordSetupToken(userId, token, expiresAt);
  },

  async findPasswordSetupByToken(token: string) {
    if (!paymentStorage || typeof paymentStorage.findPasswordSetupByToken !== 'function') {
      throw new Error('storage.findPasswordSetupByToken not implemented');
    }
    const res = await paymentStorage.findPasswordSetupByToken(token);
    return normalizeFirstRow(res);
  },

  async clearPasswordSetupToken(userId: string) {
    if (!paymentStorage || typeof paymentStorage.clearPasswordSetupToken !== 'function') {
      throw new Error('storage.clearPasswordSetupToken not implemented');
    }
    return await paymentStorage.clearPasswordSetupToken(userId);
  },

  // ----- Payments/subscriptions -----
  async recordPayment(paymentData: any) {
    if (!paymentStorage || typeof paymentStorage.recordPayment !== 'function') {
      throw new Error('storage.recordPayment not implemented');
    }
    return await paymentStorage.recordPayment(paymentData);
  },

  async upsertSubscription(sub: any) {
    if (!paymentStorage || typeof paymentStorage.upsertSubscription !== 'function') {
      throw new Error('storage.upsertSubscription not implemented');
    }
    return await paymentStorage.upsertSubscription(sub);
  },
};

export const storage = impl;
export default impl;
