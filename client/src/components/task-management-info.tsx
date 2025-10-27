import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Edit3, Trash2, Plus, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TaskManagementInfoProps {
  totalTasks: number;
  seededTasks: number;
  customTasks: number;
  onCreateTask: () => void;
}

export function TaskManagementInfo({ 
  totalTasks, 
  seededTasks, 
  customTasks, 
  onCreateTask 
}: TaskManagementInfoProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Task Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalTasks}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{seededTasks}</div>
            <div className="text-sm text-muted-foreground">Seeded Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{customTasks}</div>
            <div className="text-sm text-muted-foreground">Custom Tasks</div>
          </div>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>All tasks are fully editable!</strong> You can modify seeded tasks to match your specific needs, 
            deadlines, and requirements. Add helpful links, update descriptions, change due dates, and more.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Edit3 className="h-3 w-3" />
            Edit any task
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Trash2 className="h-3 w-3" />
            Delete tasks
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Plus className="h-3 w-3" />
            Add custom tasks
          </Badge>
        </div>

        <div className="flex justify-center">
          <Button onClick={onCreateTask} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Custom Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}