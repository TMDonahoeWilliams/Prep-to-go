import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    const { token, password, firstName, lastName } = req.body || {};
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    // Load payments module storage helpers
    let paymentsModule: any = null;
    try {
      paymentsModule = await import('../../server/payments.js');
    } catch (e1) {
      try {
        paymentsModule = await import('../../server/payments');
      } catch (e2) {
        console.error('Could not import server payments module:', e1, e2);
        return res.status(500).json({ success: false, message: 'Server storage not available' });
      }
    }
    const paymentStorage = paymentsModule?.paymentStorage ?? paymentsModule?.default ?? paymentsModule;
    if (!paymentStorage || typeof paymentStorage.findPasswordSetupByToken !== 'function') {
      return res.status(500).json({ success: false, message: 'Server not configured for token setup' });
    }

    const tokenRecord = await paymentStorage.findPasswordSetupByToken(token);
    const tokenRow = Array.isArray(tokenRecord) ? tokenRecord[0] : tokenRecord;
    if (!tokenRow) return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    if (tokenRow.password_setup_token_expires_at && new Date(tokenRow.password_setup_token_expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const userId = tokenRow.userId ?? tokenRow.id ?? tokenRow.user_id;
    const user = await paymentStorage.getUserById?.(userId);
    const foundUser = Array.isArray(user) ? user[0] : user;
    if (!foundUser) return res.status(404).json({ success: false, message: 'User not found' });

    const SUPABASE_URL = process.env.SUPABASE_URL || '';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase env missing');
      return res.status(500).json({ success: false, message: 'Auth provider not configured' });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const createPayload: any = {
      email: foundUser.email,
      password,
      email_confirm: true,
      user_metadata: {
        firstName: firstName ?? foundUser.first_name ?? foundUser.firstName ?? null,
        lastName: lastName ?? foundUser.last_name ?? foundUser.lastName ?? null,
      },
    };

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser(createPayload as any);
    if (createErr) {
      console.error('Supabase createUser error:', createErr);
      if ((createErr as any)?.message?.includes('already exists')) {
        // If user existed in Supabase already, link by looking up user by email
        const { data: users, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.find((u: any) => u.email === foundUser.email);
        if (existing && existing.id) {
          await paymentStorage.linkSupabaseUser?.(foundUser.id, existing.id);
        } else {
          return res.status(500).json({ success: false, message: 'Account exists but could not link' });
        }
      } else {
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }
    }

    const supabaseUserId = created?.id ?? created?.user?.id ?? null;
    if (!supabaseUserId) {
      // try to find by email if create didn't return id
      try {
        const list = await supabaseAdmin.auth.admin.listUsers();
        const u = list.data?.find((x: any) => x.email === foundUser.email);
        if (u) await paymentStorage.linkSupabaseUser?.(foundUser.id, u.id);
      } catch (e) {
        console.warn('Could not lookup supabase user after create:', e);
      }
    } else {
      await paymentStorage.linkSupabaseUser?.(foundUser.id, supabaseUserId);
    }

    // Optionally store password hash locally (not required if Supabase is authoritative)
    if (typeof paymentStorage.setUserPasswordHash === 'function') {
      const hash = await bcrypt.hash(password, 10);
      await paymentStorage.setUserPasswordHash(foundUser.id, hash);
    }

    // Clear token & mark email verified / set paid flag if desired
    if (typeof paymentStorage.clearPasswordSetupToken === 'function') {
      await paymentStorage.clearPasswordSetupToken(foundUser.id);
    }
    if (typeof paymentStorage.updateUserPaidStatus === 'function') {
      await paymentStorage.updateUserPaidStatus(foundUser.id, { hasPaidAccess: true, paidAt: new Date().toISOString() });
    }

    return res.status(200).json({ success: true, message: 'Account setup complete' });
  } catch (err: any) {
    console.error('complete-setup error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}
