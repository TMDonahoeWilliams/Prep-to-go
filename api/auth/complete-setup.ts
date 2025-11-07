import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

/**
 * Expected body: { token: string, password: string, firstName?: string, lastName?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { token, password, firstName, lastName } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

  try {
    // Dynamic import of your storage/payment helpers
    let paymentsModule: any;
    try {
      paymentsModule = await import('../../server/payments.js');
    } catch {
      paymentsModule = await import('../../server/payments');
    }
    const { paymentStorage } = paymentsModule;

    const tokenRecord = await paymentStorage.findPasswordSetupByToken(token);
    if (!tokenRecord) return res.status(400).json({ message: 'Invalid or expired token' });
    if (new Date(tokenRecord.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Token expired' });
    }

    const userId = tokenRecord.userId;
    const user = await paymentStorage.getUserById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Create Supabase user via admin API (service role)
    // Use the password provided by the user
    const email = user.email;
    const meta = {
      firstName: firstName ?? user.firstName ?? '',
      lastName: lastName ?? user.lastName ?? '',
    };

    // Use Supabase admin create user API
    const { data: createdUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta,
    } as any);

    if (createErr) {
      console.error('Supabase admin.createUser error:', createErr);
      // Map unique violation
      if ((createErr as any)?.message?.includes('already exists')) {
        return res.status(409).json({ message: 'An account for this email already exists' });
      }
      return res.status(500).json({ message: 'Failed to create auth user' });
    }

    // Save supabase user id on our DB user row and mark email verified / user active
    await paymentStorage.linkSupabaseUser(userId, createdUser.id || createdUser?.user?.id || createdUser?.id);

    // Clear token and mark password/setup complete
    await paymentStorage.clearPasswordSetupToken(userId);
    await paymentStorage.setUserPasswordHash(userId, await bcrypt.hash(password, 10));
    await paymentStorage.updateUserPaidStatus(userId, { hasPaidAccess: true, paidAt: new Date().toISOString() });

    // Optionally create a server session here or instruct the client to sign in via Supabase
    // Return success
    return res.status(200).json({ success: true, message: 'Account setup complete' });
  } catch (err: any) {
    console.error('complete-setup error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
