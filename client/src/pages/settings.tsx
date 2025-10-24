import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Plus, Mail, Clock, CheckCircle, UserPlus } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    studentEmail: '',
    studentFirstName: '',
    studentLastName: '',
  });

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

  // Query for student accounts (only for parents)
  const { data: studentsData } = useQuery({
    queryKey: ["/api/auth/students"],
    queryFn: async () => {
      return await apiRequest("/api/auth/students");
    },
    enabled: (user as any)?.role === 'parent',
  });

  const inviteStudent = useMutation({
    mutationFn: async (inviteData: typeof inviteForm) => {
      return await apiRequest("/api/auth/invite-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/students"] });
      setIsInviteDialogOpen(false);
      setInviteForm({ studentEmail: '', studentFirstName: '', studentLastName: '' });
      toast({
        title: "Success",
        description: "Student invitation sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
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

  const initials = (user as any)?.firstName && (user as any)?.lastName
    ? `${(user as any).firstName[0]}${(user as any).lastName[0]}`
    : (user as any)?.email?.[0]?.toUpperCase() || "U";

  const displayName = (user as any)?.firstName && (user as any)?.lastName
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.email || "User";

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
            <AvatarImage src={(user as any)?.profileImageUrl || ""} alt={displayName} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium" data-testid="text-user-name">{displayName}</p>
            <p className="text-sm text-muted-foreground" data-testid="text-user-email">{(user as any)?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Account Type</Label>
            <Select
              value={(user as any)?.role || "student"}
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

      {/* Student Management Section - Only for Parents */}
      {(user as any)?.role === 'parent' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Student Accounts</h2>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Student Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="student-email">Student Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="student@email.com"
                      value={inviteForm.studentEmail}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, studentEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-first-name">First Name</Label>
                    <Input
                      id="student-first-name"
                      placeholder="First name"
                      value={inviteForm.studentFirstName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, studentFirstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-last-name">Last Name</Label>
                    <Input
                      id="student-last-name"
                      placeholder="Last name"
                      value={inviteForm.studentLastName}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, studentLastName: e.target.value }))}
                    />
                  </div>
                  <Button 
                    onClick={() => inviteStudent.mutate(inviteForm)}
                    disabled={inviteStudent.isPending || !inviteForm.studentEmail || !inviteForm.studentFirstName || !inviteForm.studentLastName}
                    className="w-full"
                  >
                    {inviteStudent.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending Invitation...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {studentsData?.students?.map((student: any) => (
              <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.profileImageUrl || ""} alt={`${student.firstName} ${student.lastName}`} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{student.firstName} {student.lastName}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Active
                </div>
              </div>
            ))}

            {studentsData?.invitations?.map((invitation: any) => (
              <div key={invitation.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <UserPlus className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{invitation.studentFirstName} {invitation.studentLastName}</p>
                  <p className="text-sm text-muted-foreground">{invitation.studentEmail}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  Pending
                </div>
              </div>
            ))}

            {(!studentsData?.students?.length && !studentsData?.invitations?.length) && (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No student accounts yet</p>
                <p className="text-sm">Invite students to help them organize their college preparation</p>
              </div>
            )}
          </div>
        </Card>
      )}

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
