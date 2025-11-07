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
        setUser((data as any)?.session?.user ?? null);
      } catch (err) {
        console.error("useAuth: failed to get session", err);
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Register auth state change listener. supabase.auth.onAuthStateChange can return
    // different shapes across versions, so keep a reference to the returned value and
    // unsubscribe defensively on cleanup.
    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setUser(session?.user ?? null);
      } catch (e) {
        console.error("useAuth: onAuthStateChange handler error", e);
      }
    });

    return () => {
      mounted = false;
      try {
        // listener may have several shapes depending on supabase-js version:
        // - { data: { subscription } } (v2)
        // - { subscription } (other wrappers)
        // - an object with unsubscribe() method
        // - or the listener itself might be the subscription with unsubscribe()
        const anyListener: any = listener;
        if (!anyListener) return;

        // v2: { data: { subscription } }
        if (anyListener.data && anyListener.data.subscription && typeof anyListener.data.subscription.unsubscribe === "function") {
          anyListener.data.subscription.unsubscribe();
          return;
        }

        // shape: { subscription: { unsubscribe() } }
        if (anyListener.subscription && typeof anyListener.subscription.unsubscribe === "function") {
          anyListener.subscription.unsubscribe();
          return;
        }

        // direct unsubscribe function on returned object
        if (typeof anyListener.unsubscribe === "function") {
          anyListener.unsubscribe();
          return;
        }

        // in rare cases listener itself is a function to call to unsubscribe
        if (typeof anyListener === "function") {
          try { anyListener(); } catch {}
          return;
        }
      } catch (err) {
        // swallow errors on cleanup but log them
        console.warn("useAuth: failed to unsubscribe auth listener", err);
      }
    };
  }, []);

  // Sign in with Supabase + exchange token to server to create server session
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
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
        console.warn("useAuth.signIn: no access token returned from Supabase signIn");
      }

      // Refresh supabase session and user
      const { data: sessionData } = await supabase.auth.getSession();
      setUser((sessionData as any)?.session?.user ?? null);
      return { user: (sessionData as any)?.session?.user ?? null };
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
      if ((result as any).error) throw (result as any).error;
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
        console.warn("useAuth.signOut: server logout failed", e);
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
