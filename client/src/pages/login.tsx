import React, { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Prefer client-side Supabase sign-in + token exchange provided by useAuth.signIn
      if (typeof signIn === "function") {
        await signIn(email, password);
      } else {
        // Fallback: call server login endpoint directly
        const resp = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // IMPORTANT: allow Set-Cookie to be set/accepted
          body: JSON.stringify({ email, password }),
        });
        const data = await resp.json().catch(() => null);
        if (!resp.ok) {
          const msg = data?.error?.message || data?.message || "Login failed";
          throw new Error(msg);
        }
      }

      // Small delay to ensure cookie is written in browser before navigation
      await new Promise((r) => setTimeout(r, 150));

      // Navigate to dashboard (SPA navigation)
      setLocation("/");
    } catch (err: any) {
      console.error("Login error:", err);
      const msg = err?.message || "Login failed";
      setError(msg);
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded shadow">
          <h2 className="text-xl font-semibold">Sign in</h2>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
