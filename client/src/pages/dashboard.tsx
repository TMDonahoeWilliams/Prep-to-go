import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress-ring";
import { CategoryProgress } from "@/components/category-progress";
import { TaskCard } from "@/components/task-card";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { TaskDialog } from "@/components/task-dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Task, Category } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<(Task & { category?: Category })[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: stats } = useQuery<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
  }>({
    queryKey: ["/api/tasks/stats"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      setTaskDialogOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
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
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, {
        status: completed ? "completed" : "pending",
        completedAt: completed ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
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
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/tasks/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
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
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const overallProgress = stats ? (stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100 : 0;

  // Calculate category progress
  const categoryStats = categories.map(category => {
    const categoryTasks = tasks.filter(t => t.categoryId === category.id);
    const completed = categoryTasks.filter(t => t.status === 'completed').length;
    const total = categoryTasks.length;
    return {
      ...category,
      completed,
      total,
      progress: total > 0 ? (completed / total) * 100 : 0,
    };
  });

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = tasks
    .filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return dueDate >= now && dueDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  if (tasksLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your college prep progress</p>
        </div>
        <Button onClick={() => setTaskDialogOpen(true)} data-testid="button-add-task">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
              <p className="text-3xl font-bold" data-testid="text-total-tasks">{stats?.totalTasks || 0}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold text-chart-2" data-testid="text-completed-tasks">
                {stats?.completedTasks || 0}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-chart-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue</p>
              <p className="text-3xl font-bold text-destructive" data-testid="text-overdue-tasks">
                {stats?.overdueTasks || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">This Week</p>
              <p className="text-3xl font-bold text-chart-3" data-testid="text-upcoming-tasks">
                {stats?.upcomingTasks || 0}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-chart-3" />
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <Card className="p-8 flex items-center justify-center">
          <ProgressRing progress={overallProgress} />
        </Card>

        {/* Category Progress */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {categoryStats.slice(0, 4).map((category) => (
            <CategoryProgress
              key={category.id}
              name={category.name}
              progress={category.progress}
              total={category.total}
              completed={category.completed}
              color={category.color || 'chart-1'}
              icon={category.icon || 'CheckSquare'}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Upcoming This Week</h2>
          <Button variant="ghost" asChild>
            <a href="/tasks" data-testid="link-view-all-tasks">View All</a>
          </Button>
        </div>

        {upcomingTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No tasks due in the next 7 days
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(id, completed) => toggleTaskMutation.mutate({ id, completed })}
                onEdit={() => {}}
                onDelete={(id) => deleteTaskMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={(data) => createTaskMutation.mutate(data)}
        categories={categories}
        isPending={createTaskMutation.isPending}
      />
    </div>
  );
}
