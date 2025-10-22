import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      return await apiRequest("PATCH", "/api/auth/user/role", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Profile</h2>
        
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium" data-testid="text-user-name">{displayName}</h3>
            <p className="text-sm text-muted-foreground" data-testid="text-user-email">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Your Role</Label>
            <Select
              value={user.role}
              onValueChange={(value) => updateRoleMutation.mutate(value)}
              disabled={updateRoleMutation.isPending}
            >
              <SelectTrigger id="role" className="mt-2" data-testid="select-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose whether you're using this app as a student or parent
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Appearance</h2>
        
        <div className="space-y-4">
          <div>
            <Label>Theme</Label>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 text-sm">
                {theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="capitalize">{theme} Mode</span>
              </div>
              <ThemeToggle />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Toggle between light and dark mode
            </p>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Account</h2>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto"
            data-testid="button-logout"
          >
            <a href="/api/logout">Log Out</a>
          </Button>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text-sm text-muted-foreground">
          College Prep Organizer helps high school seniors and parents stay organized 
          during the college preparation journey. Track tasks, manage documents, and 
          ensure nothing falls through the cracks.
        </p>
      </Card>
    </div>
  );
}
