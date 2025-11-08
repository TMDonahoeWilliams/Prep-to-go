import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { token, password, firstName, lastName } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    // dynamic import storage helpers
    let paymentsModule: any;
    try {
      paymentsModule = await import('../../server/payments.js');
    } catch {
      paymentsModule = await import('../../server/payments');
    }
    const { paymentStorage } = paymentsModule;

    if (!paymentStorage || !paymentStorage.findPasswordSetupByToken) {
      return res.status(500).json({ message: 'Server not configured for token setup' });
    }

    const tokenRecord = await paymentStorage.findPasswordSetupByToken(token);
    if (!tokenRecord) return res.status(400).json({ message: 'Invalid or expired token' });
    if (new Date(tokenRecord.expiresAt) < new Date()) return res.status(400).json({ message: 'Token expired' });

    const userId = tokenRecord.userId;
    const user = await paymentStorage.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create Supabase user using service role key
    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase env missing');
      return res.status(500).json({ message: 'Auth provider not configured' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create the user in Supabase (admin)
    const createPayload: any = {
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: firstName ?? user.firstName ?? null,
        lastName: lastName ?? user.lastName ?? null,
      },
    };

    // supabase-js v2 admin API
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser(createPayload as any);

    if (createErr) {
      console.error('Supabase createUser error:', createErr);
      if ((createErr as any)?.message?.includes('already exists')) {
        return res.status(409).json({ message: 'Account already exists' });
      }
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // Determine Supabase user id (shapes vary)
    const supabaseUserId = created?.id ?? created?.user?.id ?? null;
    if (!supabaseUserId) {
      console.warn('Could not determine supabase user id from create result', created);
    }

    // Link and finalize user in app DB
    if (paymentStorage.linkSupabaseUser) {
      await paymentStorage.linkSupabaseUser(userId, supabaseUserId);
    }
    if (paymentStorage.clearPasswordSetupToken) {
      await paymentStorage.clearPasswordSetupToken(userId);
    }
    // Optionally store password hash locally (not required if Supabase is authoritative)
    if (paymentStorage.setUserPasswordHash) {
      const hash = await bcrypt.hash(password, 10);
      await paymentStorage.setUserPasswordHash(userId, hash);
    }
    if (paymentStorage.updateUserPaidStatus) {
      await paymentStorage.updateUserPaidStatus(userId, { hasPaidAccess: true, paidAt: new Date().toISOString() });
    }

    return res.status(200).json({ success: true, message: 'Account setup complete' });
  } catch (err: any) {
    console.error('complete-setup error:', err);
    return res.status(500).json({ message: err?.message || 'Server error' });
  }
}
