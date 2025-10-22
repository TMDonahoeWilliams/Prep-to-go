import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import type { Task, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tasks = [], isLoading } = useQuery<(Task & { category?: Category })[]>({
    queryKey: ["/api/tasks"],
  });

  // Get calendar days for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), day);
    });
  };

  // Get all tasks with due dates sorted
  const tasksWithDates = tasks
    .filter(task => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  const today = new Date();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-semibold tracking-tight mb-2">Calendar</h1>
        <p className="text-muted-foreground">View all your important deadlines and milestones</p>
      </div>

      {/* Calendar Navigation */}
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

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={idx}
                className={`min-h-24 p-2 border rounded-md ${
                  !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-card'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
                data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs p-1 rounded truncate ${
                        task.status === 'completed'
                          ? 'bg-chart-2/10 text-chart-2'
                          : 'bg-primary/10 text-primary'
                      }`}
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

      {/* Upcoming Deadlines */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Deadlines</h2>
        <div className="space-y-3">
          {tasksWithDates.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No tasks with due dates</p>
              <p className="text-sm text-muted-foreground">
                Add due dates to your tasks to see them here
              </p>
            </Card>
          ) : (
            tasksWithDates.map((task) => {
              const dueDate = new Date(task.dueDate!);
              const isOverdue = dueDate < today && task.status !== 'completed';

              return (
                <Card
                  key={task.id}
                  className={`p-4 ${task.status === 'completed' ? 'opacity-60' : ''}`}
                  data-testid={`deadline-task-${task.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3
                        className={`font-medium mb-1 ${
                          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.category && (
                          <Badge variant="secondary" className="text-xs">
                            {task.category.name}
                          </Badge>
                        )}
                        <span
                          className={`text-sm ${
                            isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                          }`}
                        >
                          {format(dueDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    {task.status === 'completed' && (
                      <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                        Completed
                      </Badge>
                    )}
                    {isOverdue && task.status !== 'completed' && (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
