import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleAuthSuccess = (user: any) => {
    console.log('handleAuthSuccess: Received user data:', user);
    
    // For login: Use fresh server data to ensure we have the latest role info
    // For registration: Use the registration data and flag as new registration
    let userToStore = user;
    
    if (!isLogin) {
      // This is registration - use the new user data and flag as new registration
      console.log('handleAuthSuccess: Registration - using new user data');
      localStorage.setItem('newRegistration', 'true');
      userToStore = user;
    } else {
      // This is login - use fresh server data to get latest role information
      console.log('handleAuthSuccess: Login - using fresh server data for latest role info');
      localStorage.removeItem('newRegistration'); // Clear any existing flag
      userToStore = user;
    }
    
    // Never store "Demo User" data
    if (userToStore.firstName === 'Demo' && userToStore.lastName === 'User') {
      console.log('handleAuthSuccess: Preventing Demo User storage');
      userToStore = {
        ...userToStore,
        firstName: 'Account',
        lastName: 'User'
      };
    }
    
    console.log('handleAuthSuccess: Final user data to store:', userToStore);
    
    // Store user data in localStorage for serverless deployment
    localStorage.setItem('user', JSON.stringify(userToStore));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Call the success callback which will handle the navigation
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
}