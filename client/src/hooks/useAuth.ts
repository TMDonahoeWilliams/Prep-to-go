import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check localStorage on mount and when refreshKey changes
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    console.log('useAuth: Checking localStorage', { authStatus, userData: userData?.substring(0, 100) });
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      try {
        const parsedUser = JSON.parse(userData);
        console.log('useAuth: Parsed user from localStorage:', parsedUser);
        setStoredUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        setStoredUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      setStoredUser(null);
    }
  }, [refreshKey]);

  const { data: apiUser, isLoading } = useQuery({
    queryKey: ["/api/auth/user", refreshKey],
    retry: false,
    enabled: !storedUser && !isAuthenticated, // Only fetch from API if no stored user and not authenticated
  });

  // Use stored user if available, otherwise use API user
  const user = storedUser || apiUser;
  const finalIsAuthenticated = isAuthenticated || !!apiUser;

  console.log('useAuth: Final state', { 
    storedUser: storedUser ? `${(storedUser as any).firstName} ${(storedUser as any).lastName}` : null,
    apiUser: apiUser ? `${(apiUser as any).firstName} ${(apiUser as any).lastName}` : null,
    finalUser: user ? `${(user as any).firstName} ${(user as any).lastName}` : null,
    isAuthenticated: finalIsAuthenticated,
    isLoading
  });

  return {
    user,
    isLoading,
    isAuthenticated: finalIsAuthenticated,
    refreshAuth: () => setRefreshKey(prev => prev + 1), // Method to manually refresh auth state
  };
}
