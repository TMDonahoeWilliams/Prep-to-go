import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * useAuth hook (named export)
 * - Keeps Supabase client session in sync
 * - signIn exchanges access token with server endpoint /api/auth/supabase-login
 * - Exposes: { user, loading, signIn, signUp, signOut }
 */
export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data?.session?.user ?? null);
      } catch (err) {
        console.error("useAuth: failed to get session", err);
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe?.();
      } catch {
        // ignore unsubscribe errors in some runtime environments
      }
    };
  }, []);

  // Sign in with Supabase + exchange token to server to create server session
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // supabase returns helpful error.message
        throw error;
      }

      const accessToken = (data as any)?.session?.access_token;
      if (accessToken) {
        // Exchange token for server session so server-side routes using req.session.userId continue to work.
        const resp = await fetch("/api/auth/supabase-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // important for cookie set by server
          body: JSON.stringify({ accessToken }),
        });

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(`Server session exchange failed: ${resp.status} ${text}`);
        }
      } else {
        // If no access token (e.g. magic-link flow), we may still proceed; server exchange may not be needed
        console.warn("useAuth.signIn: no access token returned from Supabase signIn");
      }

      // Refresh supabase session and user
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData?.session?.user ?? null);
      return { user: sessionData?.session?.user ?? null };
    } catch (err) {
      console.error("useAuth.signIn error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up (creates supabase user). Caller can then call signIn to exchange token with server.
  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      // For many setups you may want to auto sign-in or require email confirmation.
      return result;
    } catch (err) {
      console.error("useAuth.signUp error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out locally and clear server session (if endpoint exists)
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Try to clear server session cookie (if server supports /api/auth/logout)
      try {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      } catch (e) {
        // ignore failures; fall back to client-only sign-out
      }
      setUser(null);
    } catch (err) {
      console.error("useAuth.signOut error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

export default useAuth;
