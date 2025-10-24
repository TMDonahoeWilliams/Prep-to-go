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
    console.log('handleAuthSuccess: Received user data:', user);
    
    // For login: IGNORE API response if we have existing localStorage data
    // For registration: Use the registration data that was passed
    const existingUserData = localStorage.getItem('user');
    let userToStore = user;
    
    if (existingUserData && !isLogin) {
      // This is registration - use the new user data
      console.log('handleAuthSuccess: Registration - using new user data');
      userToStore = user;
    } else if (existingUserData && isLogin) {
      // This is login - preserve existing localStorage data
      try {
        const parsedExisting = JSON.parse(existingUserData);
        console.log('handleAuthSuccess: Login - preserving existing localStorage data:', parsedExisting);
        userToStore = parsedExisting;
      } catch (error) {
        console.error('Failed to parse existing data:', error);
        userToStore = user;
      }
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