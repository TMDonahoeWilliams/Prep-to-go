import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Use service role key only on the server
const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: 'accessToken required' });

  // Verify token and fetch user
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data?.user) {
    console.error('supabase getUser failed:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }

  const sbUser = data.user;
  // Map or create your app user in DB here. Example: find user by email or sbUser.id
  const appUserId = sbUser.id; // or map to your users table id

  // Create server session (requires express-session / connect-pg setup)
  (req as any).session.userId = appUserId;
  (req as any).session.userEmail = sbUser.email;
  try {
    await (req as any).session.save?.();
  } catch (err) {
    // on some session libs save is sync or not available in serverless; you may ignore or handle
    console.warn('session.save not available or failed:', err);
  }

  return res.json({ success: true });
}
