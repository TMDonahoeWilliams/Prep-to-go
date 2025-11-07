import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Create an admin/client instance on the server using the service role key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { accessToken } = req.body || {};
    if (!accessToken) {
      return res.status(400).json({ message: "accessToken is required" });
    }

    // Verify token and fetch user with the admin client
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user) {
      console.error("supabase getUser error:", error);
      return res.status(401).json({ message: "Invalid access token" });
    }

    const sbUser = data.user;

    // Map Supabase user to your app user id here.
    // If you already store users in your DB, find or create the corresponding app user record.
    // Example uses Supabase user id as app user id; adapt to your DB logic as needed.
    const appUserId = sbUser.id;

    // Attach to server session (this requires your server to use express-session or similar)
    // In Vercel serverless functions you might have session middleware; if not, modify as appropriate.
    (req as any).session = (req as any).session || {};
    (req as any).session.userId = appUserId;
    (req as any).session.userEmail = sbUser.email;

    // If session.save exists (express-session), call it
    if (typeof (req as any).session.save === "function") {
      await (req as any).session.save();
    }

    return res.status(200).json({ success: true, userId: appUserId });
  } catch (err: any) {
    console.error("supabase-login error:", err);
    return res.status(500).json({ message: err?.message || "Server error" });
  }
}
