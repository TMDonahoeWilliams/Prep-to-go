import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ message: "accessToken required" });

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data?.user) {
    console.error("supabase getUser error:", error);
    return res.status(401).json({ message: "Invalid access token" });
  }

  const sbUser = data.user;
  // Option A: If you have a session store available, set req.session.* here (existing server).
  // Option B: For serverless, set an HttpOnly cookie manually (example below).
  const cookieValue = encodeURIComponent(JSON.stringify({ id: sbUser.id, email: sbUser.email }));
  // Cookie expires in 7 days (adjust)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  res.setHeader("Set-Cookie", `session_user=${cookieValue}; Path=/; Expires=${expires}; HttpOnly; Secure; SameSite=None`);

  return res.status(200).json({ success: true, userId: sbUser.id });
}
