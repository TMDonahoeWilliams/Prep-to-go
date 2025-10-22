import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks() {
  const { toast } = useToast();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: categories = [] } = useCategories();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

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

  const handleTaskEdit = (task: any) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, data });
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        await createTask.mutateAsync(data);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      setTaskDialogOpen(false);
      setEditingTask(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingTask ? "update" : "create"} task`,
        variant: "destructive",
      });
    }
  };

  // Filter and search logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || task.categoryId === filterCategory;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  // Group tasks by status
  const pendingTasks = filteredTasks.filter((t) => t.status === "pending");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  if (tasksLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your college prep checklist</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTask(undefined);
            setTaskDialogOpen(true);
          }}
          data-testid="button-create-task"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full sm:w-40" data-testid="select-priority-filter">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tasks by Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            All ({filteredTasks.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            To Do ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
                onEdit={() => handleTaskEdit(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-2">
          {pendingTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No pending tasks</p>
            </Card>
          ) : (
            pendingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
                onEdit={() => handleTaskEdit(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-2">
          {inProgressTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tasks in progress</p>
            </Card>
          ) : (
            inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
                onEdit={() => handleTaskEdit(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2">
          {completedTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No completed tasks</p>
            </Card>
          ) : (
            completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={(completed) => handleTaskToggle(task.id, completed)}
                onEdit={() => handleTaskEdit(task)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(undefined);
        }}
        onSubmit={handleSubmit}
        categories={categories}
        initialData={editingTask}
      />
    </div>
  );
}
