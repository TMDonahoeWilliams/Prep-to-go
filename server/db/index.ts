// https://github.com/TMDonahoeWilliams/Prep-to-go/blob/main/server/db/index.ts
/**
 * DB entrypoint shim.
 *
 * - Provides a single module that server/payments.ts can import as "./db/index.js".
 * - If you have a real DB client (Prisma, Drizzle, knex), replace the exported methods below
 *   with real implementations that interact with your database.
 *
 * The default implementation here throws with clear messages to help you wire the DB.
 */

function notImplemented(name: string) {
  return () => {
    throw new Error(
      `DB helper "${name}" is not implemented. Replace server/db/index.ts with your DB client implementation that provides this method.`
    );
  };
}

export const db = {
  // Implement these methods in your real DB layer
  getUserByEmail: notImplemented('getUserByEmail'),
  getUserById: notImplemented('getUserById'),
  createUser: notImplemented('createUser'),
  updateUserStripeCustomerId: notImplemented('updateUserStripeCustomerId'),
  linkSupabaseUser: notImplemented('linkSupabaseUser'),
  updateUserPaidStatus: notImplemented('updateUserPaidStatus'),
  setUserPasswordHash: notImplemented('setUserPasswordHash'),
  savePasswordSetupToken: notImplemented('savePasswordSetupToken'),
  findPasswordSetupByToken: notImplemented('findPasswordSetupByToken'),
  clearPasswordSetupToken: notImplemented('clearPasswordSetupToken'),
  recordPayment: notImplemented('recordPayment'),
  upsertSubscription: notImplemented('upsertSubscription'),
  getUserSubscription: notImplemented('getUserSubscription'),
  hasUserPaidAccess: notImplemented('hasUserPaidAccess'),
};

// If you have a schema file, export it here; otherwise the payments layer will try to import server/db/schema.
export { users, payments, subscriptions } from './schema';
