import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeedTasks } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Sparkles, CheckSquare } from "lucide-react";

export function SeedTasksButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const seedTasks = useSeedTasks();
  const [hasSeededTasks, setHasSeededTasks] = useState(
    localStorage.getItem('tasksSeeded') === 'true'
  );

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
      
      setHasSeededTasks(true);
      
      toast({
        title: "Tasks Added Successfully! 🎉",
        description: "12 essential college prep tasks have been added to your account.",
      });
    } catch (error) {
      toast({
        title: "Error Adding Tasks",
        description: "Failed to add default tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (hasSeededTasks) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Default tasks already added</span>
        <Badge variant="secondary" className="text-xs">
          12 tasks
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Badge variant="outline" className="text-xs justify-center">
          <CheckSquare className="h-3 w-3 mr-1" />
          FAFSA Application
        </Badge>
        <Badge variant="outline" className="text-xs justify-center">
          <CheckSquare className="h-3 w-3 mr-1" />
          College Applications
        </Badge>
        <Badge variant="outline" className="text-xs justify-center">
          <CheckSquare className="h-3 w-3 mr-1" />
          Major Scholarships
        </Badge>
        <Badge variant="outline" className="text-xs justify-center">
          <CheckSquare className="h-3 w-3 mr-1" />
          Transcripts & Testing
        </Badge>
      </div>
      
      <Button 
        onClick={handleSeedTasks}
        disabled={seedTasks.isPending}
        size="sm"
        className="w-fit"
      >
        {seedTasks.isPending ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Adding Tasks...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Add Default Tasks (12 tasks)
          </>
        )}
      </Button>
    </div>
  );
}