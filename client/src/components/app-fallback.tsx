import { DiagnosticPanel } from '@/components/diagnostic-panel';

export function AppFallback() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">College Prep Organizer</h1>
          <p className="text-muted-foreground">
            The app encountered an issue loading. Use the diagnostic panel below to troubleshoot.
          </p>
        </div>
        <DiagnosticPanel />
      </div>
    </div>
  );
}