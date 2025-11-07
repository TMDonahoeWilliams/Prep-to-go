// API: POST /api/auth/accept-invitation/:token
// This handler returns structured error objects so the client can surface them cleanly.
// It is intentionally defensive and returns consistent JSON shapes:
// - Success: 200 { success: true, userId: string, message: string }
// - Error:   <status> { error: { code: string, message: string, details?: any } }

import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Helper: send structured error response
 */
function sendError(
  res: VercelResponse,
  status: number,
  code: string,
  message: string,
  details?: any
) {
  res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
}

/**
 * Placeholder helpers - replace these with your real DB/service implementations.
 * - findInvitation(token): returns invitation record or null
 * - createUser(payload): creates user account and returns user object
 * - markInvitationAccepted(token, userId): marks invitation processed
 *
 * Example shapes used below; adapt to your database layer.
 */
async function findInvitation(token: string | undefined) {
  // TODO: replace with real DB lookup
  if (!token) return null;
  // Simulated invitation for demo mode
  if (token === "demo-token") {
    return {
      token,
      studentEmail: "student@example.com",
      expiresAt: null,
      accepted: false,
      parentId: "parent-demo-id",
      parentName: "Jane Doe",
    };
  }
  return null;
}

async function createUser({ email, password, firstName, lastName }: any) {
  // TODO: replace with real user creation in DB or via auth provider
  // Return created user object with id
  return {
    id: `user-${Date.now()}`,
    email,
    firstName,
    lastName,
  };
}

async function markInvitationAccepted(token: string, userId: string) {
  // TODO: mark invitation as accepted in DB
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method?.toUpperCase();

  // Only accept POST for creation
  if (method !== "POST") {
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Only POST is allowed for this endpoint");
  }

  // Token comes from path param when using route /api/auth/accept-invitation/[token]
  const token = (req.query && (req.query.token as string)) || undefined;

  if (!token) {
    return sendError(res, 400, "MISSING_TOKEN", "Invitation token is required");
  }

  // Parse and validate body
  const body = req.body || {};
  const email = (body.email || "").toString().trim().toLowerCase();
  const password = (body.password || "").toString();
  const confirmPassword = (body.confirmPassword || "").toString();
  const firstName = (body.firstName || "").toString().trim();
  const lastName = (body.lastName || "").toString().trim();

  if (!email) {
    return sendError(res, 400, "MISSING_EMAIL", "Email is required");
  }

  if (!password) {
    return sendError(res, 400, "MISSING_PASSWORD", "Password is required");
  }

  // Strong, clear validation rules, returned as structured errors
  if (password !== confirmPassword) {
    return sendError(res, 400, "PASSWORD_MISMATCH", "Passwords do not match");
  }

  if (password.length < 8) {
    return sendError(
      res,
      400,
      "PASSWORD_TOO_WEAK",
      "Password must be at least 8 characters long",
      { minLength: 8 }
    );
  }

  // Additional password strength checks can be added here (regex, entropy, etc.)
  // Now verify invitation existence and that the email matches
  try {
    const invitation = await findInvitation(token);

    if (!invitation) {
      return sendError(res, 404, "INVITATION_NOT_FOUND", "Invitation token is invalid or expired");
    }

    if (invitation.accepted) {
      return sendError(res, 409, "INVITATION_ALREADY_ACCEPTED", "Invitation has already been accepted");
    }

    // If invitation includes a pre-specified student email, ensure it matches
    if (invitation.studentEmail && invitation.studentEmail.toLowerCase() !== email.toLowerCase()) {
      return sendError(
        res,
        400,
        "EMAIL_MISMATCH",
        "The provided email does not match the invitation email",
        { expected: invitation.studentEmail }
      );
    }

    // Create the user (this may throw on unique constraint violations etc.)
    let createdUser;
    try {
      createdUser = await createUser({ email, password, firstName, lastName });
    } catch (err: any) {
      // Map DB/driver errors to structured API errors where possible
      // Example: unique constraint violation -> USER_ALREADY_EXISTS
      const msg = err?.message || String(err);
      if (/unique|duplicate/i.test(msg)) {
        return sendError(res, 409, "USER_ALREADY_EXISTS", "A user with that email already exists");
      }
      console.error("createUser error:", err);
      return sendError(res, 500, "USER_CREATION_FAILED", "Failed to create user account", {
        originalError: msg,
      });
    }

    // Mark invitation accepted
    try {
      await markInvitationAccepted(token, createdUser.id);
    } catch (err: any) {
      console.error("markInvitationAccepted error:", err);
      // Non-fatal from user's perspective but we should surface it
      return sendError(
        res,
        500,
        "INVITATION_UPDATE_FAILED",
        "Account created but failed to update invitation state",
        { originalError: err?.message || String(err) }
      );
    }

    // Success response: structured, predictable
    return res.status(200).json({
      success: true,
      userId: createdUser.id,
      message: "Student account created successfully",
    });
  } catch (err: any) {
    console.error("accept-invitation unexpected error:", err);
    return sendError(res, 500, "SERVER_ERROR", "An unexpected server error occurred", {
      originalError: err?.message || String(err),
    });
  }
}
