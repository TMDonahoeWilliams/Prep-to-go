import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryProgressProps {
  name: string;
  progress: number; // 0-100
  total: number;
  completed: number;
  color?: string;
  icon?: string;
}

// Explicit color mappings for Tailwind to detect
const colorClasses = {
  'chart-1': {
    bg: 'bg-chart-1/10',
    text: 'text-chart-1',
  },
  'chart-2': {
    bg: 'bg-chart-2/10',
    text: 'text-chart-2',
  },
  'chart-3': {
    bg: 'bg-chart-3/10',
    text: 'text-chart-3',
  },
  'chart-4': {
    bg: 'bg-chart-4/10',
    text: 'text-chart-4',
  },
  'chart-5': {
    bg: 'bg-chart-5/10',
    text: 'text-chart-5',
  },
  'primary': {
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
};

export function CategoryProgress({
  name,
  progress,
  total,
  completed,
  color = "chart-1",
  icon = "CheckSquare",
}: CategoryProgressProps) {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.CheckSquare) as LucideIcon;
  
  // Get color classes, default to chart-1 if not found
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses['chart-1'];

  return (
    <Card className="p-4" data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${colors.bg}`}>
            <IconComponent className={`h-4 w-4 ${colors.text}`} />
          </div>
          <div>
            <h3 className="font-medium text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {completed} of {total} tasks
            </p>
          </div>
        </div>
        <span className="text-lg font-semibold" data-testid={`text-category-progress-${name.toLowerCase().replace(/\s+/g, '-')}`}>
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </Card>
  );
}
