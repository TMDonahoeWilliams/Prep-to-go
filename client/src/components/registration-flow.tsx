import { useState } from "react";
import { RegisterForm } from "@/components/register-form";
import { RoleSelection } from "@/components/role-selection";
import { Paywall } from "@/components/paywall";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface RegistrationFlowProps {
  onComplete: () => void;
}

type RegistrationStep = 'register' | 'role' | 'payment';

export function RegistrationFlow({ onComplete }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('register');
  const [userData, setUserData] = useState<any>(null);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleRegistrationSuccess = (user: any) => {
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('newRegistration', 'true'); // Flag to indicate this is a new registration
    setUserData(user);
    setCurrentStep('role');
  };

  const handleRoleSelected = () => {
    // Move to payment step instead of completing
    setCurrentStep('payment');
  };

  const handlePaymentComplete = () => {
    // Payment complete, finish the flow
    queryClient.invalidateQueries({ queryKey: ["/api/payments/check-access"] });
    onComplete();
  };

  switch (currentStep) {
    case 'register':
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md">
            <RegisterForm
              onSuccess={handleRegistrationSuccess}
              onSwitchToLogin={() => {
                // Switch to login by going back to auth page
                setLocation('/auth');
              }}
            />
          </div>
        </div>
      );

    case 'role':
      return (
        <RoleSelection 
          onRoleSelected={handleRoleSelected}
          userEmail={userData?.email}
        />
      );

    case 'payment':
      return (
        <Paywall 
          userEmail={userData?.email}
          onPaymentComplete={handlePaymentComplete}
          isPartOfRegistration={true}
        />
      );

    default:
      return null;
  }
}