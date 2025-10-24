import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertCircle, Plus, CalendarPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTasks, useCreateTask } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'medium',
    assignedTo: 'student',
  });
  const { toast } = useToast();

  const { data: tasks = [], isLoading, error, refetch } = useTasks();
  const { data: categories = [] } = useCategories();
  const createTaskMutation = useCreateTask();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks for calendar",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.categoryId || !selectedDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        ...newTask,
        dueDate: selectedDate.toISOString().split('T')[0], // Pass as date string
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setNewTask({
        title: '',
        description: '',
        categoryId: '',
        priority: 'medium',
        assignedTo: 'student',
      });
      setSelectedDate(null);
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsCreateDialogOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  const tasksWithDates = tasks
    .filter(task => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const today = new Date();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground mt-1">View all your important deadlines and milestones</p>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <p className="font-semibold mb-1">Failed to load calendar</p>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading your tasks. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Calendar</h1>
        <p className="text-muted-foreground mt-1">View all your important deadlines and milestones</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {calendarDays.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={i}
                className={`min-h-24 p-2 border rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                onClick={() => isCurrentMonth && handleDayClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="text-xs p-1 rounded truncate"
                      style={{
                        backgroundColor: `hsl(var(--${task.category?.color || 'chart-1'}) / 0.1)`,
                        color: `hsl(var(--${task.category?.color || 'chart-1'}))`,
                      }}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
        {tasksWithDates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks with due dates</p>
        ) : (
          <div className="space-y-3">
            {tasksWithDates.slice(0, 10).map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-md hover-elevate"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{task.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {task.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                  </div>
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'destructive'
                        : task.priority === 'high'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Task Creation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                Due date: {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={newTask.categoryId} 
                onValueChange={(value) => setNewTask(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select 
                  value={newTask.assignedTo} 
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
