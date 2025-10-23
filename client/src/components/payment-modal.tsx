import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Shield, Clock } from "lucide-react";
import { PRICING_PLANS } from "@/lib/stripe";
import { CheckoutForm } from "./checkout-form.tsx";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export function PaymentModal({ isOpen, onClose, userEmail }: PaymentModalProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const plan = PRICING_PLANS.BASIC;

  if (showCheckout) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              Secure payment powered by Stripe
            </DialogDescription>
          </DialogHeader>
          <CheckoutForm 
            priceId={plan.stripePriceId}
            amount={plan.price}
            currency={plan.currency}
            userEmail={userEmail}
            onSuccess={() => {
              onClose();
              window.location.reload(); // Refresh to show paid content
            }}
            onCancel={() => setShowCheckout(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Unlock College Prep Organizer</DialogTitle>
          <DialogDescription className="text-center">
            Get instant access to everything you need for college preparation
          </DialogDescription>
        </DialogHeader>

        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Most Popular</Badge>
            </div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="text-3xl font-bold text-primary">
              ${(plan.price / 100).toFixed(2)}
              {plan.interval === 'one-time' && <span className="text-sm font-normal text-muted-foreground ml-1">one-time</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Features */}
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span>Safe Payment</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              className="w-full text-lg h-12"
              onClick={() => setShowCheckout(true)}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Get Instant Access
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment processing by Stripe. Your information is protected.
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}