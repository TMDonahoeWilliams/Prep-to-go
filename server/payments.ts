/**
 * paymentStorage helper (server/payments.ts)
 *
 * - Dynamically loads ./db/index and ./db/schema (tries .js then .ts) to avoid
 *   directory import / ESM resolution problems on Vercel.
 * - Exports `paymentStorage` (named + default) so other modules can import it.
 *
 * IMPORTANT:
 * - Replace the placeholder db implementation with your real DB client/schema for production.
 * - The current implementation delegates to server/db/index.ts (the shim) if present.
 */

type DbModule = { db?: any } | null;
type SchemaModule = { users?: any; payments?: any; subscriptions?: any } | null;

let cachedDbModule: DbModule | undefined = undefined;
let cachedSchemaModule: SchemaModule | undefined = undefined;

async function loadDbModule(): Promise<DbModule> {
  if (cachedDbModule !== undefined) return cachedDbModule;
  try {
    const m = await import('./db/index.js');
    cachedDbModule = (m as DbModule) || null;
    return cachedDbModule;
  } catch (errJs) {
    try {
      const m = await import('./db/index');
      cachedDbModule = (m as DbModule) || null;
      return cachedDbModule;
    } catch (errTs) {
      console.error('Could not import server/db/index (tried .js and .ts):', errJs, errTs);
      cachedDbModule = null;
      return null;
    }
  }
}

async function loadSchemaModule(): Promise<SchemaModule> {
  if (cachedSchemaModule !== undefined) return cachedSchemaModule;
  try {
    const m = await import('./db/schema.js');
    cachedSchemaModule = (m as SchemaModule) || null;
    return cachedSchemaModule;
  } catch (errJs) {
    try {
      const m = await import('./db/schema');
      cachedSchemaModule = (m as SchemaModule) || null;
      return cachedSchemaModule;
    } catch (errTs) {
      console.error('Could not import server/db/schema (tried .js and .ts):', errJs, errTs);
      cachedSchemaModule = null;
      return null;
    }
  }
}

function notReadyError(feature: string) {
  return new Error(
    `Database not configured for payments.${feature}. Ensure you have implemented server/db (index.ts) and server/db/schema.ts and that they are included in the build output.`
  );
}

function normalizeFirstRow(result: any) {
  if (!result) return null;
  if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
  return result;
}

const paymentStorage = {
  async getUserByEmail(email: string) {
    const mod = await loadDbModule();
    const schema = await loadSchemaModule();
    if (!mod || !mod.db || !schema) {
      throw notReadyError('getUserByEmail');
    }
    try {
      // Delegate to db.getUserByEmail in the shim or real DB.
      return await mod.db.getUserByEmail(email);
    } catch (err) {
      console.error('getUserByEmail error:', err);
      throw err;
    }
  },

  async getUserById(id: string) {
    const mod = await loadDbModule();
    const schema = await loadSchemaModule();
    if (!mod || !mod.db || !schema) {
      throw notReadyError('getUserById');
    }
    try {
      return await mod.db.getUserById(id);
    } catch (err) {
      console.error('getUserById error:', err);
      throw err;
    }
  },

  async createUser(payload: any) {
    const mod = await loadDbModule();
    const schema = await loadSchemaModule();
    if (!mod || !mod.db || !schema) {
      throw notReadyError('createUser');
    }
    try {
      return await mod.db.createUser(payload);
    } catch (err) {
      console.error('createUser error:', err);
      throw err;
    }
  },

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('updateUserStripeCustomerId');
    try {
      return await mod.db.updateUserStripeCustomerId(userId, stripeCustomerId);
    } catch (err) {
      console.error('updateUserStripeCustomerId error:', err);
      throw err;
    }
  },

  async linkSupabaseUser(userId: string, supabaseUserId: string | null) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('linkSupabaseUser');
    try {
      return await mod.db.linkSupabaseUser(userId, supabaseUserId);
    } catch (err) {
      console.error('linkSupabaseUser error:', err);
      throw err;
    }
  },

  async updateUserPaidStatus(userId: string, data: any) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('updateUserPaidStatus');
    try {
      return await mod.db.updateUserPaidStatus(userId, data);
    } catch (err) {
      console.error('updateUserPaidStatus error:', err);
      throw err;
    }
  },

  async setUserPasswordHash(userId: string, hash: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('setUserPasswordHash');
    try {
      return await mod.db.setUserPasswordHash(userId, hash);
    } catch (err) {
      console.error('setUserPasswordHash error:', err);
      throw err;
    }
  },

  async savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('savePasswordSetupToken');
    try {
      return await mod.db.savePasswordSetupToken(userId, token, expiresAt);
    } catch (err) {
      console.error('savePasswordSetupToken error:', err);
      throw err;
    }
  },

  async findPasswordSetupByToken(token: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('findPasswordSetupByToken');
    try {
      const res = await mod.db.findPasswordSetupByToken(token);
      return normalizeFirstRow(res);
    } catch (err) {
      console.error('findPasswordSetupByToken error:', err);
      throw err;
    }
  },

  async clearPasswordSetupToken(userId: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('clearPasswordSetupToken');
    try {
      return await mod.db.clearPasswordSetupToken(userId);
    } catch (err) {
      console.error('clearPasswordSetupToken error:', err);
      throw err;
    }
  },

  async recordPayment(paymentData: any) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('recordPayment');
    try {
      return await mod.db.recordPayment(paymentData);
    } catch (err) {
      console.error('recordPayment error:', err);
      throw err;
    }
  },

  async upsertSubscription(sub: any) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('upsertSubscription');
    try {
      return await mod.db.upsertSubscription(sub);
    } catch (err) {
      console.error('upsertSubscription error:', err);
      throw err;
    }
  },

  async getUserSubscription(userId: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('getUserSubscription');
    try {
      return await mod.db.getUserSubscription(userId);
    } catch (err) {
      console.error('getUserSubscription error:', err);
      throw err;
    }
  },

  async hasUserPaidAccess(userId: string) {
    const mod = await loadDbModule();
    if (!mod || !mod.db) throw notReadyError('hasUserPaidAccess');
    try {
      return await mod.db.hasUserPaidAccess(userId);
    } catch (err) {
      console.error('hasUserPaidAccess error:', err);
      throw err;
    }
  },
};

export const paymentStorage = paymentStorage;
export default paymentStorage;
