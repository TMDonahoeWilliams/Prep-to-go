import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/login
 *
 * - Returns structured JSON and never issues redirects (SPA clients must navigate).
 * - Sets CORS and credential headers safely so Set-Cookie can be accepted.
 * - Tries to validate credentials against server storage (dynamic import).
 *
 * Response shapes:
 *  - 200 { success: true, user: { id, email, firstName?, lastName? } }
 *  - 400 { success: false, error: { code, message } }  // bad request
 *  - 401 { success: false, error: { code, message } }  // auth failed
 *  - 403 { success: false, error: { code, message } }  // forbidden (e.g., needs password setup)
 *  - 500 { success: false, error: { code, message } }  // server error
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS + credentials: allow the incoming origin (not "*") so cookies are accepted.
  const origin = (req.headers.origin as string) || process.env.APP_BASE_URL || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true, message: 'OK' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST allowed' } });
  }

  try {
    const body = req.body || {};
    const email = (body.email || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' } });
    }

    // Dynamic import of server storage so build-time missing modules don't crash imports.
    let storageModule: any = null;
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

    if (!storageModule) {
      console.error('storage module unavailable; cannot validate credentials');
      return res.status(500).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: 'Server storage not available' } });
    }

    // Accept either named exports or default
    const storage = storageModule.storage ?? storageModule.default ?? storageModule;

    // getUserByEmail may return an array or single row; normalize to first row.
    let user: any = null;
    try {
      const found = await storage.getUserByEmail?.(email);
      if (Array.isArray(found)) user = found.length > 0 ? found[0] : null;
      else user = found ?? null;
      console.log('storage.getUserByEmail result for', email, '=>', !!user);
    } catch (err) {
      console.error('storage.getUserByEmail error:', err);
      return res.status(500).json({ success: false, error: { code: 'STORAGE_ERROR', message: 'Error querying user storage' } });
    }

    if (!user) {
      // Intentionally do not reveal whether an email exists in production, but for debugging return a code.
      console.log('Login failed: user not found:', email);
      return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Invalid email or password' } });
    }

    // Determine password hash field name flexibly
    const passwordHash = user.passwordHash ?? user.password_hash ?? user.password ?? null;

    if (!passwordHash) {
      // The user exists but has no local password (maybe created via payment flow or Supabase).
      console.log('Login failed: user requires password setup:', email);
      return res.status(403).json({
        success: false,
        error: { code: 'NEEDS_PASSWORD_SETUP', message: 'This account requires password setup. Check your email for setup instructions.' },
      });
    }

    // Validate password
    const match = await bcrypt.compare(password, passwordHash);
    if (!match) {
      console.log('Login failed: invalid password for', email);
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    // Credentials valid. Attach session/cookie if possible.
    try {
      if ((req as any).session) {
        (req as any).session.userId = user.id;
        (req as any).session.userEmail = user.email;
        if (typeof (req as any).session.save === 'function') {
          await (req as any).session.save();
        }
        console.log('User logged in and session saved (server session):', user.email);
      } else {
        // Fallback: set a minimal HttpOnly cookie. In production use secure server-side session tokens.
        const cookieVal = encodeURIComponent(JSON.stringify({ id: user.id }));
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString(); // 7 days
        // Use SameSite=None and Secure for cross-site cookies over HTTPS.
        res.setHeader('Set-Cookie', `session_user=${cookieVal}; Path=/; Expires=${expires}; HttpOnly; Secure; SameSite=None`);
        console.log('User logged in and lightweight cookie set:', user.email);
      }
    } catch (sessErr) {
      console.warn('Failed to attach session/cookie:', sessErr);
    }

    // Return sanitized user data (do not include password hash)
    const responseUser = {
      id: user.id,
      email: user.email,
      firstName: user.first_name ?? user.firstName ?? null,
      lastName: user.last_name ?? user.lastName ?? null,
    };

    return res.status(200).json({ success: true, message: 'User logged in successfully', user: responseUser });
  } catch (err: any) {
    console.error('auth/login unexpected error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Internal server error' } });
  }
}
