import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckSquare, Calendar, FileText, Users, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

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
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              Stay organized and on track from senior year through college move-in. 
              Built for students and parents to collaborate seamlessly.
            </p>
            <div className="text-center mb-8">
              <div className="text-3xl font-bold text-primary mb-2">$4.99</div>
              <p className="text-muted-foreground">One-time payment • Lifetime access</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation('/register')}
                className="text-lg px-8"
                data-testid="button-get-started"
              >
                Get Started - $4.99
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setLocation('/auth')}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-login"
                >
                  Login Here
                </button>
              </p>
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

      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            No subscriptions, no hidden fees. Pay once, use forever.
          </p>
        </div>

        <Card className="p-8 border-2 border-primary/20 max-w-md mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Complete Access</h3>
            <div className="text-5xl font-bold text-primary mb-2">$4.99</div>
            <p className="text-muted-foreground mb-6">One-time payment</p>
            
            <div className="space-y-3 text-left mb-8">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Complete task management system</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Calendar with deadline tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Document organization tools</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Parent/student collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Progress monitoring dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">Lifetime access & updates</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg"
              onClick={() => setLocation('/register')}
            >
              Get Instant Access
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              Secure payment • Instant access • 30-day satisfaction guarantee
            </p>
          </div>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="p-8 sm:p-12 text-center bg-primary/5">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Organized?</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join students and families who are staying on top of their college preparation journey.
          </p>
          <div className="text-2xl font-bold text-primary mb-6">Just $4.99 • One-time payment</div>
          <Button 
            size="lg" 
            onClick={() => setLocation('/register')}
            data-testid="button-register-footer"
            className="text-lg px-8"
          >
            Start Your Journey Today
          </Button>
          
          <div className="mt-4">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => setLocation('/auth')}
                className="text-primary hover:underline font-medium"
                data-testid="button-login-footer"
              >
                Login Here
              </button>
            </p>
          </div>
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
