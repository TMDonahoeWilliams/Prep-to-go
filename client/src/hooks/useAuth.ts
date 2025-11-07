// Ensure your signIn performs exchange and throws on non-200
const signIn = async (email: string, password: string) => {
  // 1) Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const accessToken = data?.session?.access_token;
  if (accessToken) {
    const resp = await fetch("/api/auth/supabase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // IMPORTANT: allow server to set cookie
      body: JSON.stringify({ accessToken }),
    });

    if (!resp.ok) {
      // read body safely so you see the actual error
      const text = await resp.text().catch(() => "");
      throw new Error(`Server session exchange failed: ${resp.status} ${text}`);
    }
  }

  // Refresh local supabase session/user state
  const { data: sessionData } = await supabase.auth.getSession();
  setUser(sessionData?.session?.user ?? null);
  return { user: sessionData?.session?.user ?? null };
};
