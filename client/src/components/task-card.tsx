import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MoreVertical, ExternalLink, CheckCircle, Clock, Play, Edit3, Trash2, ChevronDown, ChevronUp, StickyNote, AlertTriangle } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

interface TaskCardProps {
  task: Task & { category?: Category | null };
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
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  const isSeededTask = task.title.includes('FAFSA') || 
    task.title.includes('💰') || 
    task.title.includes('🚨') || 
    task.title.includes('scholarship') || 
    task.title.includes('college application') ||
    task.title.includes('SAT') ||
    task.title.includes('ACT') ||
    task.description?.includes('college prep') ||
    task.description?.includes('financial aid') ||
    task.description?.includes('Common Application') ||
    task.description?.includes('National Merit') ||
    task.description?.includes('transcript');

  const helpfulLink = (task as any).helpfulLink || (task as any).helpful_link;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card
        className={`hover-elevate transition-all cursor-pointer ${isCompleted ? 'opacity-60' : ''} ${isOverdue ? 'border-destructive' : ''} ${isExpanded ? 'ring-2 ring-primary/20' : 'hover:shadow-md'}`}
        data-testid={`card-task-${task.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={(checked) => onToggle(task.id, !!checked)}
              className="mt-1"
              data-testid={`checkbox-task-${task.id}`}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <h3
                    className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                    data-testid={`text-task-title-${task.id}`}
                  >
                    {task.title}
                  </h3>
                  {isOverdue && (
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-expand-task-${task.id}`}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isExpanded ? 'Collapse details' : 'Expand to see full details and edit'}</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        data-testid={`button-task-menu-${task.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(task)}
                        data-testid={`button-edit-task-${task.id}`}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(task.id)}
                        className="text-destructive flex items-center gap-2"
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick summary info - always visible */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
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

                {isSeededTask && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    College Prep
                  </Badge>
                )}

                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    {isOverdue && <span className="text-destructive">(Overdue)</span>}
                  </div>
                )}

                {/* Status selector in compact mode */}
                <Select
                  value={task.status}
                  onValueChange={(value) => onStatusChange(task.id, value)}
                >
                  <SelectTrigger className="h-6 w-auto min-w-[100px] text-xs border-0 p-1">
                    <SelectValue>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
                          return <StatusIcon className="h-3 w-3" />;
                        })()}
                        <span className="capitalize text-xs">
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

              {/* Helpful Link and Edit Button - always visible for important actions */}
              <div className="flex flex-wrap items-center gap-2">
                {helpfulLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-7 text-xs"
                  >
                    <a
                      href={helpfulLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Complete Online
                    </a>
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="h-7 text-xs"
                  data-testid={`button-quick-edit-${task.id}`}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Expandable content */}
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            
            <div className="space-y-4">
              {/* Full Description */}
              {task.description && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <StickyNote className="h-4 w-4" />
                    Description
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Notes */}
              {task.notes && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {task.notes}
                  </p>
                </div>
              )}

              {/* Assignment */}
              {task.assignedTo && (
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned To
                  </h4>
                  <Badge variant="outline" className="capitalize">
                    {task.assignedTo}
                  </Badge>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                {task.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <div>
                    <span className="font-medium">Updated:</span> {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span> {format(new Date(task.completedAt), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
