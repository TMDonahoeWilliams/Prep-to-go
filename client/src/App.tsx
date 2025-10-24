import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { Paywall } from "@/components/paywall";
import { RoleSelection } from "@/components/role-selection";
import { AuthPage } from "@/components/auth-page";
import { RegistrationFlow } from "@/components/registration-flow";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Calendar from "@/pages/calendar";
import Documents from "@/pages/documents";
import Settings from "@/pages/settings";

function Router() {
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();
  const { data: paymentStatus, isLoading: isPaymentLoading } = usePaymentStatus();
  const queryClient = useQueryClient();

  // Show loading while checking auth or payment status
  if (isLoading || (isAuthenticated && isPaymentLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page and auth routes if not authenticated
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/auth" component={() => <AuthPage onAuthSuccess={() => {
          // Refresh auth state to re-read from localStorage
          refreshAuth();
        }} />} />
        <Route path="/register" component={() => <RegistrationFlow onComplete={() => {
          // Refresh auth state after complete registration flow
          refreshAuth();
        }} />} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Show role selection if authenticated but no role selected
  if (isAuthenticated && user && !(user as any)?.role) {
    return <RoleSelection onRoleSelected={() => {
      // Refresh auth state to get updated role from localStorage
      refreshAuth();
    }} />;
  }

  // Show paywall if authenticated but hasn't paid
  if (isAuthenticated && paymentStatus && !paymentStatus.hasPaidAccess) {
    return <Paywall userEmail={(user as any)?.email} />;
  }

  // Show main app if authenticated and has paid access
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user as any} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/documents" component={Documents} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
