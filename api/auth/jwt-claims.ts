import type { VercelRequest, VercelResponse } from '@vercel/node';

// Endpoint that Supabase will POST to when generating access tokens.
// See Supabase docs: the hook gets called with a body containing user info.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  // Supabase will POST a payload (see Supabase docs). Typical fields: sub, email, role, ...
  const payload = req.body || {};

  const userId = payload.sub || payload.user_id || payload.id || null;
  const userEmail = payload.email || null;

  // Read your DB to decide claims. Example uses a server helper to query subscriptions.
  // Implement getUserPaidStatus to query your DB for hasPaidAccess, plan, expiresAt, etc.
  try {
    const { getUserPaidStatus } = await import('../../server/payments.js'); // or your DB helper
    const status = userId ? await getUserPaidStatus(userId) : userEmail ? await getUserPaidStatus(null, userEmail) : null;
    // status = { hasPaidAccess: boolean, planType?: string, expiresAt?: string }

    // Always namespace custom claims (recommended): https://yourdomain.com/claims/...
    const claims: Record<string, any> = {
      'https://collegeprep.example.com/has_paid': !!status?.hasPaidAccess,
      'https://collegeprep.example.com/plan': status?.planType ?? null,
      'https://collegeprep.example.com/expires_at': status?.expiresAt ?? null,
      // Any other small flags you need
    };

    // Return shape expected by Supabase: { claims: { ... } }
    return res.status(200).json({ claims });
  } catch (err: any) {
    console.error('jwt-claims hook error:', err);
    // Return empty claims on error (avoid blocking token issuance)
    return res.status(200).json({ claims: {} });
  }
}
