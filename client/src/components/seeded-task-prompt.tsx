import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SeededTaskPromptProps {
  seededTasksCount: number;
}

export function SeededTaskPrompt({ seededTasksCount }: SeededTaskPromptProps) {
  if (seededTasksCount === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-2">
              College Prep Tasks Ready to Customize!
            </h3>
            
            <p className="text-sm text-green-700 mb-3">
              You have <Badge variant="secondary" className="mx-1">{seededTasksCount}</Badge> 
              pre-loaded college preparation tasks. Each task includes:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <ChevronDown className="h-3 w-3" />
                <span>Detailed descriptions & notes</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <ExternalLink className="h-3 w-3" />
                <span>Direct links to complete online</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <Edit3 className="h-3 w-3" />
                <span>Fully customizable for your needs</span>
              </div>
            </div>
            
            <Alert className="bg-white/70 border-green-200">
              <Edit3 className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Click the <ChevronDown className="h-3 w-3 inline mx-1" /> 
                expand arrow on any task to see full details, then click "Edit" to customize 
                due dates, add personal notes, or update requirements for your specific situation.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}