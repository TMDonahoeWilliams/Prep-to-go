import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Generic API entrypoint
 *
 * Fixes:
 * - Use req.method / req.url (previous code referenced `method`, `url`, `res` etc.
 *   as free identifiers which caused TS2304 "Cannot find name" errors).
 * - Provide a robust `pathname` extraction and a small routing example.
 * - Always return valid JSON and handle errors so the function never leaves stray tokens.
 *
 * Replace or extend the route handling below with your app's real logic.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const method = req.method ?? "GET";
    const rawUrl = req.url ?? "/";
    // req.url may contain query string; extract pathname only
    const pathname = rawUrl.split("?")[0];

    // Example routes — adapt to your existing endpoints
    if (method === "GET" && (pathname === "/" || pathname === "/api" || pathname === "/api/health")) {
      return res.status(200).json({ ok: true, message: "API healthy" });
    }

    if (method === "GET" && pathname === "/api/payments/check-access") {
      // placeholder response — replace with real implementation
      return res.status(200).json({
        hasPaidAccess: false,
        subscriptionStatus: "inactive",
        planType: null,
        expiresAt: null,
        trialEndsAt: null,
        message: "Demo mode - complete payment flow to access app",
      });
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      // If you keep a legacy login handler here, ensure you refer to req.body and do proper validation.
      // This is a placeholder to avoid TS errors; wire to your actual auth logic instead.
      const body = req.body || {};
      const email = (body.email || "").toString();
      return res.status(200).json({ success: true, message: `Logged in (placeholder): ${email}` });
    }

    // Add your other API routes here...
    // If you previously used bare identifiers such as `method`, `url`, `res` in top-level scope,
    // ensure you rewrite them to reference req.method, req.url and use local `res` variable.

    // Fallback: not found
    return res.status(404).json({ error: "Not found", path: pathname, method });
  } catch (err: any) {
    console.error("api/index error:", err?.stack ?? err);
    // Keep the error shape stable (JSON)
    try {
      return res.status(500).json({ error: "Internal server error", details: err?.message });
    } catch {
      // worst-case plain text fallback
      res.setHeader("Content-Type", "text/plain");
      return res.status(500).send("Internal server error");
    }
  }
}
