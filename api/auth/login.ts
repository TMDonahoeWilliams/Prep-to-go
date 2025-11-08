import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/login
 *
 * - Returns JSON (never redirects) so SPA clients can handle navigation.
 * - Tries to set a server session if available (req.session). If session middleware is not present
 *   (serverless), sets a minimal HttpOnly cookie so the browser has a server-bound identifier.
 * - Expects body: { email, password }
 *
 * Response:
 *  - 200 { success: true, message, userId }
 *  - 4xx/5xx { success: false, error: { code, message, details? } }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS / headers for browser clients. Keep minimal and safe.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).json({ success: true, message: 'OK' });
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST allowed' } });
    }

    const body = req.body || {};
    const email = (body.email || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' },
      });
    }

    // Dynamic import of your server storage/auth helpers so Vercel resolves compiled modules correctly
    let storageModule: any;
    try {
      storageModule = await import('../../server/storage.js');
    } catch (errJs) {
      try {
        storageModule = await import('../../server/storage');
      } catch (errTs) {
        console.warn('Could not import server storage module:', errJs, errTs);
        storageModule = null;
      }
    }

    // Attempt to validate credentials against your DB user store if available
    let user: any = null;
    if (storageModule && storageModule.getUserByEmail) {
      try {
        const found = await storageModule.getUserByEmail(email);
        user = Array.isArray(found) ? found[0] : found;
      } catch (err) {
        console.error('storage.getUserByEmail error:', err);
        // continue; will return auth failure below
      }
    }

    // If storage is available and user found, validate password hash
    if (user) {
      const passwordHash = user.passwordHash || user.password_hash || user.password; // accomodate different naming
      if (!passwordHash) {
        // no local password stored — cannot authenticate here
        return res.status(400).json({
          success: false,
          error: { code: 'NO_PASSWORD_LOCALLY', message: 'This account requires password setup via Supabase or completed registration' },
        });
      }
      const ok = await bcrypt.compare(password, passwordHash);
      if (!ok) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }
    } else {
      // Storage not available or user not found. We do not attempt to sign in here.
      // If your app uses Supabase for auth (recommended), the client-side should call Supabase signIn
      // and then exchange token with the server. Return an instructive message to the client.
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message:
            'User not found in server DB. If you use Supabase auth, please sign in via Supabase client and exchange token with the server.',
        },
      });
    }

    // At this point credentials valid. Try to attach server-side session if supported.
    try {
      // If express-session or similar is available on req.session, use it.
      if ((req as any).session) {
        (req as any).session.userId = user.id;
        (req as any).session.userEmail = user.email;
        // some session libs have save()
        if (typeof (req as any).session.save === 'function') {
          await (req as any).session.save();
        }
        console.log('User logged in and session saved (server session):', user.email);
      } else {
        // No session middleware: set an HttpOnly cookie with a minimal identifier.
        // NOTE: in production you should set a secure server-side session token instead of embedding user info.
        const cookieVal = encodeURIComponent(JSON.stringify({ id: user.id }));
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(); // 7 days
        // Secure & SameSite=None required for cross-site cookie acceptance; ensure you use HTTPS in prod.
        res.setHeader(
          'Set-Cookie',
          `session_user=${cookieVal}; Path=/; Expires=${expires}; HttpOnly; Secure; SameSite=None`
        );
        console.log('User logged in and lightweight cookie set:', user.email);
      }
    } catch (sessErr) {
      console.warn('Failed to attach server session/cookie:', sessErr);
    }

    // Return canonical JSON success (client will perform SPA navigation)
    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      userId: user.id,
    });
  } catch (err: any) {
    console.error('auth/login error:', err);
    try {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Internal server error' } });
    } catch {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(500).send('Internal server error');
    }
  }
}
