import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { CategoryProgress } from "@/components/category-progress";
import { TaskCard } from "@/components/task-card";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { TaskDialog } from "@/components/task-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTasks, useTaskStats, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: stats } = useTaskStats();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const overallProgress = stats ? Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0 : 0;

  const handleTaskToggle = async (id: string, completed: boolean) => {
    try {
      await updateTask.mutateAsync({
        id,
        data: {
          status: completed ? "completed" : "pending",
          completedAt: completed ? new Date().toISOString() : null,
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleTaskDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleCreateTask = async (data: any) => {
    try {
      await createTask.mutateAsync(data);
      setTaskDialogOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  // Calculate category progress
  const categoryProgress = categories.map((category) => {
    const categoryTasks = tasks.filter((t) => t.categoryId === category.id);
    const completed = categoryTasks.filter((t) => t.status === "completed").length;
    const total = categoryTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      ...category,
      progress,
      total,
      completed,
    };
  });

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "completed" && t.dueDate)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate!).getTime();
      const dateB = new Date(b.dueDate!).getTime();
      return dateA - dateB;
    })
    .slice(0, 5);

  if (tasksLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your college prep overview</p>
        </div>
        <Button 
          onClick={() => setTaskDialogOpen(true)}
          data-testid="button-create-task"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold" data-testid="text-total-tasks">{stats?.totalTasks || 0}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold" data-testid="text-completed-tasks">{stats?.completedTasks || 0}</p>
            </div>
            <ProgressRing progress={overallProgress} size={48} strokeWidth={4} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive" data-testid="text-overdue-tasks">{stats?.overdueTasks || 0}</p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-md">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming (7 days)</p>
              <p className="text-2xl font-bold" data-testid="text-upcoming-tasks">{stats?.upcomingTasks || 0}</p>
            </div>
            <div className="p-3 bg-chart-2/10 rounded-md">
              <CheckCircle2 className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Progress */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Progress by Category</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryProgress.map((category) => (
            <CategoryProgress
              key={category.id}
              name={category.name}
              progress={category.progress}
              total={category.total}
              completed={category.completed}
              color={category.color || "chart-1"}
              icon={category.icon || "CheckSquare"}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
        {upcomingTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No upcoming tasks with deadlines</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleCreateTask}
        categories={categories}
      />
    </div>
  );
}
