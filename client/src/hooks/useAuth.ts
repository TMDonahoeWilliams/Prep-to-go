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
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      try {
        setStoredUser(JSON.parse(userData));
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
    enabled: !storedUser, // Only fetch from API if no stored user
  });

  // Use stored user if available, otherwise use API user
  const user = storedUser || apiUser;
  const finalIsAuthenticated = isAuthenticated || !!apiUser;

  return {
    user,
    isLoading,
    isAuthenticated: finalIsAuthenticated,
    refreshAuth: () => setRefreshKey(prev => prev + 1), // Method to manually refresh auth state
  };
}
