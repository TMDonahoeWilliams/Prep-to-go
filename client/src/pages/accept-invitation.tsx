import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AcceptInvitation() {
  const [, params] = useRoute("/accept-invitation/:token");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = params?.token;
    if (!token) {
      setIsLoading(false);
      setInvitation(null);
      return;
    }

    // Try to fetch real invitation details from the API; fall back to a safe simulated payload.
    (async () => {
      try {
        // If you have a server endpoint for invitation lookup, this will use it.
        // Ensure apiRequest returns the parsed JSON or throws on non-OK responses.
        const inv = await apiRequest(`/api/invitations/${token}`, {
          method: "GET",
        });

        if (inv) {
          setInvitation(inv);
          setFormData((prev) => ({
            ...prev,
            email: inv.studentEmail ?? prev.email,
            firstName: inv.studentFirstName ?? prev.firstName,
            lastName: inv.studentLastName ?? prev.lastName,
          }));
        } else {
          // fallback simulated invitation
          setInvitation({
            studentEmail: "student@example.com",
            studentFirstName: "John",
            studentLastName: "Doe",
            parentName: "Jane Doe",
          });
          setFormData((prev) => ({
            ...prev,
            email: "student@example.com",
            firstName: "John",
            lastName: "Doe",
          }));
        }
      } catch (err) {
        // If the API is not available, use a safe simulated invite so the page still works in demo mode.
        console.warn("Failed to load invitation details, falling back to demo:", err);
        setInvitation({
          studentEmail: "student@example.com",
          studentFirstName: "John",
          studentLastName: "Doe",
          parentName: "Jane Doe",
        });
        setFormData((prev) => ({
          ...prev,
          email: "student@example.com",
          firstName: "John",
          lastName: "Doe",
        }));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params?.token]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setError("");
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const token = params?.token;
    if (!token) {
      setError("Invalid invitation token");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Use apiRequest helper so it can apply auth, baseURL, etc. If you prefer fetch, ensure you handle CSRF/CORS
      await apiRequest(`/api/auth/accept-invitation/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      toast({
        title: "Success!",
        description: "Your student account has been created successfully.",
      });

      // Use router navigation instead of window.location to stay SPA-friendly.
      setLocation("/login");
    } catch (err: any) {
      // apiRequest may throw a structured error or a string; handle safely
      const message =
        err?.message ||
        (typeof err === "string" ? err : "Failed to create account. Please try again.");
      setError(message);
      console.error("Accept invitation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading invitation...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Invalid Invitation</h1>
          <p className="text-muted-foreground mb-4">This invitation link is invalid or has expired.</p>
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Create Student Account</h1>
          <p className="text-muted-foreground">
            You've been invited by <strong>{invitation.parentName}</strong> to create a student account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="p-3 rounded-md bg-destructive/15 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed as it was specified in the invitation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                minLength={8}
                aria-describedby="password-help"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p id="password-help" className="text-xs text-muted-foreground mt-1">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
