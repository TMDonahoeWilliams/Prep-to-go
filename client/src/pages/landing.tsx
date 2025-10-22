import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckSquare, Calendar, FileText, Users, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Complete College
              <span className="block text-primary">Prep Companion</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Stay organized and on track from senior year through college move-in. 
              Built for students and parents to collaborate seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="text-lg px-8"
                data-testid="button-get-started"
              >
                <a href="/api/login">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools to manage your college transition
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="p-3 bg-primary/10 rounded-md w-fit mb-4">
              <CheckSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Task Management</h3>
            <p className="text-sm text-muted-foreground">
              Track applications, FAFSA, housing, and all college prep tasks with due dates and priorities.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 bg-chart-2/10 rounded-md w-fit mb-4">
              <Calendar className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p className="text-sm text-muted-foreground">
              Visualize all important deadlines and milestones in one comprehensive calendar.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 bg-chart-3/10 rounded-md w-fit mb-4">
              <FileText className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Organize transcripts, recommendations, financial aid forms, and all important paperwork.
            </p>
          </Card>

          <Card className="p-6">
            <div className="p-3 bg-chart-4/10 rounded-md w-fit mb-4">
              <Users className="h-6 w-6 text-chart-4" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Shared Access</h3>
            <p className="text-sm text-muted-foreground">
              Students and parents collaborate with role-based views and responsibilities.
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-12 text-center bg-primary/5">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Organized?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join students and families who are staying on top of their college preparation journey.
          </p>
          <Button size="lg" asChild data-testid="button-login-footer">
            <a href="/api/login">
              Log In to Get Started
            </a>
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} College Prep Organizer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
