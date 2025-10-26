import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MoreVertical, ExternalLink, CheckCircle, Clock, Play } from "lucide-react";
import { format } from "date-fns";
import type { Task, Category } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskCardProps {
  task: Task & { category?: Category };
  onToggle: (id: string, completed: boolean) => void;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  high: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const statusIcons = {
  pending: Clock,
  in_progress: Play,
  completed: CheckCircle,
};

export function TaskCard({ task, onToggle, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  return (
    <Card
      className={`p-4 hover-elevate transition-all ${isCompleted ? 'opacity-60' : ''}`}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) => onToggle(task.id, !!checked)}
          className="mt-1"
          data-testid={`checkbox-task-${task.id}`}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
              data-testid={`text-task-title-${task.id}`}
            >
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2"
                  data-testid={`button-task-menu-${task.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(task)}
                  data-testid={`button-edit-task-${task.id}`}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                  data-testid={`button-delete-task-${task.id}`}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {(task as any).helpfulLink && (
            <div className="mb-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-8 text-xs"
              >
                <a
                  href={(task as any).helpfulLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Complete Task Online
                </a>
              </Button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {task.category && (
              <Badge variant="secondary" className="text-xs">
                {task.category.name}
              </Badge>
            )}
            
            <Badge
              variant="outline"
              className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium}`}
            >
              {task.priority}
            </Badge>

            {task.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="capitalize">{task.assignedTo}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select
              value={task.status}
              onValueChange={(value) => onStatusChange(task.id, value)}
            >
              <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs border-0 p-1">
                <SelectValue>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
                      return <StatusIcon className="h-3 w-3" />;
                    })()}
                    <span className="capitalize">
                      {task.status === 'in_progress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem value="in_progress">
                  <div className="flex items-center gap-2">
                    <Play className="h-3 w-3" />
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
