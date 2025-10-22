import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { toast } = useToast();

  const { data: tasks = [], isLoading, error, refetch } = useTasks();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks for calendar",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
                className={`min-h-24 p-2 border rounded-md ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
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
    </div>
  );
}
