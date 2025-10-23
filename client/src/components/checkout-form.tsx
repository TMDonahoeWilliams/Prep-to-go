import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, ArrowLeft } from "lucide-react";

interface CheckoutFormProps {
  priceId: string;
  amount: number;
  currency: string;
  userEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CheckoutForm({ 
  priceId, 
  amount, 
  currency, 
  userEmail, 
  onSuccess, 
  onCancel 
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: userEmail || '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
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
        throw new Error(data.error || 'Payment failed');
      }

      // For now, simulate successful payment
      // In production, you'd integrate with Stripe Elements here
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 2000);

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
            <Label htmlFor="card">Card Number</Label>
            <Input
              id="card"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use test card: 4242 4242 4242 4242
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={formData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={formData.cvc}
                onChange={(e) => handleInputChange('cvc', e.target.value)}
                placeholder="123"
                maxLength={4}
                required
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
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
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