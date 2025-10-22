import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  const updateRole = useMutation({
    mutationFn: async (role: string) => {
      return await apiRequest("/api/auth/user/role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const initials = user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user.email?.[0]?.toUpperCase() || "U";

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email || "User";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profileImageUrl || ""} alt={displayName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium" data-testid="text-user-name">{displayName}</p>
            <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Account Type</Label>
            <Select
              value={user.role || "student"}
              onValueChange={(value) => updateRole.mutate(value)}
            >
              <SelectTrigger id="role" data-testid="select-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Choose whether you're a student or parent
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label>Theme</Label>
            <p className="text-sm text-muted-foreground">
              Current theme: {theme === "dark" ? "Dark" : "Light"}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <Button
          variant="outline"
          asChild
          data-testid="button-logout"
        >
          <a href="/api/logout">Log Out</a>
        </Button>
      </Card>
    </div>
  );
}
