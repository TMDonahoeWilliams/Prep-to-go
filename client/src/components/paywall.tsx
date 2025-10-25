import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Clock, Users, FileText, Calendar, TrendingUp, Shield } from "lucide-react";
import { PaymentModal } from "./payment-modal";

interface PaywallProps {
  userEmail?: string;
  onPaymentComplete?: () => void;
  isPartOfRegistration?: boolean;
}

export function Paywall({ userEmail, onPaymentComplete, isPartOfRegistration = false }: PaywallProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Premium Access Required
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            College Prep
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Organizer</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Stay organized and never miss a deadline during your college preparation journey. 
            Built for students and parents working together.
          </p>
          
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto"
            onClick={() => setShowPaymentModal(true)}
          >
            Get Instant Access - $4.99
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Comprehensive checklist system with due dates, priorities, and progress tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Calendar className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Calendar Integration</CardTitle>
              <CardDescription>
                Visual timeline of all deadlines and milestones with deadline reminders
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Family Collaboration</CardTitle>
              <CardDescription>
                Shared access for students and parents with role-based task assignments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Category-wise completion percentages and overall progress monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <FileText className="h-8 w-8 text-red-600 mb-2" />
              <CardTitle>Document Tracking</CardTitle>
              <CardDescription>
                Organize transcripts, recommendations, financial aid forms, and applications
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Shield className="h-8 w-8 text-indigo-600 mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is encrypted and secure. Built with privacy and security in mind
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader className="text-center">
              <Badge variant="default" className="w-fit mx-auto mb-2">
                Limited Time
              </Badge>
              <CardTitle className="text-2xl">Complete Access</CardTitle>
              <CardDescription>Everything you need for college preparation</CardDescription>
              <div className="text-4xl font-bold text-primary mt-4">
                $4.99
                <span className="text-sm font-normal text-muted-foreground ml-2">one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "Complete task management system",
                  "Calendar with deadline tracking",
                  "Document organization tools", 
                  "Progress monitoring dashboard",
                  "Parent/student collaboration",
                  "Mobile & desktop access",
                  "Secure data encryption",
                  "Lifetime access & updates"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full text-lg h-12 mt-6"
                onClick={() => setShowPaymentModal(true)}
              >
                Get Instant Access
              </Button>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Instant access after payment</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Secure payment by Stripe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Join thousands of families who have successfully organized their college preparation</p>
        </div>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        userEmail={userEmail}
        onPaymentComplete={onPaymentComplete}
      />
    </div>
  );
}