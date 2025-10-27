import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CheckoutFormProps {
  priceId: string;
  amount: number;
  currency: string;
  userEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Internal checkout form component that uses Stripe Elements
function CheckoutFormInner({ 
  priceId, 
  amount, 
  currency, 
  userEmail, 
  onSuccess, 
  onCancel 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: userEmail || '',
    name: ''
  });

  // Create payment intent when component mounts
  useEffect(() => {
    if (formData.email) {
      createPaymentIntent();
    }
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          userEmail: formData.email,
          priceId,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please wait and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card information not found');
      setIsLoading(false);
      return;
    }

    try {
      // Confirm payment with Stripe using the client secret
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm the payment with our backend
        const confirmResponse = await fetch('/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userEmail: formData.email,
          }),
          credentials: 'include',
        });

        const confirmData = await confirmResponse.json();

        if (!confirmResponse.ok) {
          throw new Error(confirmData.message || 'Payment confirmation failed');
        }

        // Store payment success in localStorage
        localStorage.setItem('paymentStatus', JSON.stringify({
          hasPaidAccess: true,
          subscriptionStatus: 'active',
          planType: 'basic',
          confirmedAt: new Date().toISOString(),
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        }));

        console.log('Payment completed successfully');
        
        // Show success toast
        toast({
          title: "Payment Successful! 🎉",
          description: "Welcome to College Prep Organizer! Redirecting to your dashboard...",
          duration: 3000,
        });
        
        setIsLoading(false);
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        throw new Error('Payment was not completed successfully');
      }

    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Payment failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Payment Details</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Card Details</Label>
            <div className="border rounded-md p-3 bg-background">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !stripe || !clientSecret}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !clientSecret ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ${(amount / 100).toFixed(2)}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            🔒 Your payment information is secure and encrypted
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// Main export component that wraps with Stripe Elements
export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
}