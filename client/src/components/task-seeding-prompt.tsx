import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Sparkles, Clock, X, CheckCircle } from "lucide-react";
import { useSeedTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TaskSeedingPromptProps {
  onDismiss?: () => void;
}

export function TaskSeedingPrompt({ onDismiss }: TaskSeedingPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const seedTasks = useSeedTasks();

  useEffect(() => {
    // Check if user needs task seeding and hasn't dismissed it
    const needsSeeding = localStorage.getItem('needsTaskSeeding') === 'true';
    const dismissed = localStorage.getItem('taskSeedingDismissed') === 'true';
    
    if (needsSeeding && !dismissed && (user as any)?.id) {
      setShowPrompt(true);
    }
  }, [user]);

  const handleSeedTasks = async () => {
    const userId = (user as any)?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "User information not found. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      await seedTasks.mutateAsync(userId);
      
      toast({
        title: "Tasks Added Successfully! 🎉",
        description: "12 essential college prep tasks have been added to help you get organized.",
      });
      
      setShowPrompt(false);
      onDismiss?.();
    } catch (error) {
      toast({
        title: "Error Adding Tasks",
        description: "Failed to add default tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('taskSeedingDismissed', 'true');
    localStorage.removeItem('needsTaskSeeding');
    setIsDismissed(true);
    setShowPrompt(false);
    onDismiss?.();
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div className="mb-6">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <Sparkles className="h-4 w-4 text-blue-600" />
        <div className="flex items-start justify-between w-full">
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Get Started with Essential College Prep Tasks
            </h4>
            <AlertDescription className="text-blue-800 dark:text-blue-200 mb-4">
              We notice you don't have any tasks yet. Would you like us to add 12 essential college preparation 
              tasks to help you get organized? These include FAFSA deadlines, scholarship applications, 
              and other critical milestones.
            </AlertDescription>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
              <Badge variant="secondary" className="text-xs">
                <CheckSquare className="h-3 w-3 mr-1" />
                FAFSA Application
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckSquare className="h-3 w-3 mr-1" />
                College Applications
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckSquare className="h-3 w-3 mr-1" />
                Scholarships
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <CheckSquare className="h-3 w-3 mr-1" />
                Transcripts
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSeedTasks}
                disabled={seedTasks.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {seedTasks.isPending ? (
                  <>
                    <Clock className="h-3 w-3 mr-1 animate-spin" />
                    Adding Tasks...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Yes, Add Default Tasks
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                disabled={seedTasks.isPending}
              >
                No, I'll Create My Own
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
            disabled={seedTasks.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}