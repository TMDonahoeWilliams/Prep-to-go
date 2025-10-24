import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { useQueryClient } from "@tanstack/react-query";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const queryClient = useQueryClient();

  const handleAuthSuccess = (user: any) => {
    // For serverless demo, check if we already have user data in localStorage
    // If so, preserve the existing user data instead of overwriting with API response
    const existingUserData = localStorage.getItem('user');
    let userToStore = user;
    
    if (existingUserData) {
      try {
        const parsedExistingUser = JSON.parse(existingUserData);
        // If existing user has the same email and more complete data, use it
        if (parsedExistingUser.email === user.email && 
            (parsedExistingUser.firstName !== 'Demo' || parsedExistingUser.lastName !== 'User')) {
          console.log('Preserving existing user data instead of overwriting with API response');
          userToStore = parsedExistingUser;
        }
      } catch (error) {
        console.error('Failed to parse existing user data:', error);
      }
    }
    
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