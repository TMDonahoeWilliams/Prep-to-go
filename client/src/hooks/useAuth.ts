import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // Try to get current session from Supabase client
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Sign in with Supabase and then exchange token for server session
  const signIn = async (email: string, password: string) => {
    // 1) Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }

    // 2) Extract access token and POST it to your server to create a server session
    const accessToken = data?.session?.access_token;
    if (!accessToken) {
      // No token => still return; maybe using magic link or other flow
      return { user: data?.user ?? null };
    }

    const resp = await fetch("/api/auth/supabase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // important so server can set session cookie
      body: JSON.stringify({ accessToken }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Server session exchange failed: ${resp.status} ${text}`);
    }

    // Optionally refresh user from Supabase client or map server response
    const { data: sessionData } = await supabase.auth.getSession();
    setUser(sessionData?.session?.user ?? null);

    return { user: sessionData?.session?.user ?? null };
  };

  const signOut = async () => {
    // Sign out from Supabase and tell server to clear session if needed
    await supabase.auth.signOut();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const signUp = async (email: string, password: string) => {
    const result = await supabase.auth.signUp({ email, password });
    return result;
  };

  return { user, loading, signIn, signOut, signUp };
}
