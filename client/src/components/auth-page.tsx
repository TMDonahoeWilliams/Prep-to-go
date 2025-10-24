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
    console.log('handleAuthSuccess: Received user data from API:', user);
    
    // For serverless demo, check if we already have user data in localStorage
    // If so, preserve the existing user data instead of overwriting with API response
    let existingUserData = localStorage.getItem('user');
    let userToStore = user;
    
    console.log('handleAuthSuccess: Existing localStorage data:', existingUserData);
    
    // Clean up any old demo data that might be stored
    if (existingUserData) {
      try {
        const parsedExisting = JSON.parse(existingUserData);
        // If existing data is clearly demo data with generic info, clear it
        if ((parsedExisting.firstName === 'Demo' && parsedExisting.lastName === 'User') ||
            parsedExisting.email === 'demo@collegeprep.app' ||
            parsedExisting.id === 'demo-user-vercel' ||
            parsedExisting.id === 'demo-user-fallback') {
          console.log('handleAuthSuccess: Clearing old demo data from localStorage');
          localStorage.removeItem('user');
          existingUserData = null;
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
      }
    }
    
    if (existingUserData) {
      try {
        const parsedExistingUser = JSON.parse(existingUserData);
        console.log('handleAuthSuccess: Parsed existing user:', parsedExistingUser);
        
        // If existing user has the same email, prefer existing data unless it's clearly demo data
        if (parsedExistingUser.email === user.email) {
          // If existing user data has real names (not Demo User), use it
          if (parsedExistingUser.firstName !== 'Demo' && parsedExistingUser.lastName !== 'User' &&
              parsedExistingUser.firstName && parsedExistingUser.lastName) {
            console.log('handleAuthSuccess: Preserving existing real user data');
            userToStore = parsedExistingUser;
          } 
          // If API response has better data than "Demo User", use API data
          else if (user.firstName !== 'Demo' && user.lastName !== 'User' &&
                   user.firstName && user.lastName) {
            console.log('handleAuthSuccess: Using API response (better than existing demo data)');
            userToStore = user;
          }
          // Otherwise, try to merge the best parts
          else {
            console.log('handleAuthSuccess: Merging user data');
            userToStore = {
              ...parsedExistingUser,
              ...user,
              // Keep role and other data from existing if available
              role: parsedExistingUser.role || user.role,
            };
          }
        } else {
          console.log('handleAuthSuccess: Different email, using API response data');
        }
      } catch (error) {
        console.error('Failed to parse existing user data:', error);
      }
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