import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, GraduationCap, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RoleSelectionProps {
  onRoleSelected: () => void;
  userEmail?: string;
}

export function RoleSelection({ onRoleSelected, userEmail }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select your role to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/auth/user/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      toast({
        title: "Welcome!",
        description: `Your account has been set up as a ${selectedRole}`,
      });

      onRoleSelected();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to set up your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to College Prep Organizer!</h1>
          <p className="text-muted-foreground">
            {userEmail && `Hi ${userEmail}! `}
            Please select your role to personalize your experience.
          </p>
        </div>

        <div className="space-y-6">
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Student</div>
                    <div className="text-sm text-muted-foreground">
                      I'm a high school student preparing for college
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="parent" id="parent" />
                <Label htmlFor="parent" className="flex items-center space-x-3 cursor-pointer flex-1">
                  <div className="p-2 bg-green-100 rounded-md">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Parent</div>
                    <div className="text-sm text-muted-foreground">
                      I'm a parent helping my child with college preparation
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <Button 
            onClick={handleSubmit} 
            disabled={!selectedRole || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Setting up your account..." : "Continue"}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          You can change this later in your settings.
        </div>
      </Card>
    </div>
  );
}