import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import type { Document } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
}

const statusColors = {
  pending: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  received: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  submitted: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

export function DocumentCard({ document, onEdit, onDelete }: DocumentCardProps) {
  const isOverdue = document.dueDate && new Date(document.dueDate) < new Date() && document.status === 'pending';

  return (
    <Card className="p-4 hover-elevate" data-testid={`card-document-${document.id}`}>
      <div className="flex items-start gap-3">
        <div className="p-3 bg-muted rounded-md">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-sm" data-testid={`text-document-name-${document.id}`}>
              {document.name}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2"
                  data-testid={`button-document-menu-${document.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(document)}
                  data-testid={`button-edit-document-${document.id}`}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(document.id)}
                  className="text-destructive"
                  data-testid={`button-delete-document-${document.id}`}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {document.description && (
            <p className="text-xs text-muted-foreground mb-3">
              {document.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {document.type && (
              <Badge variant="secondary" className="text-xs capitalize">
                {document.type.replace('_', ' ')}
              </Badge>
            )}
            
            <Badge
              variant="outline"
              className={`text-xs ${statusColors[document.status as keyof typeof statusColors] || statusColors.pending}`}
            >
              {document.status}
            </Badge>

            {document.dueDate && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isOverdue ? 'text-destructive' : 'text-muted-foreground'
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(document.dueDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
