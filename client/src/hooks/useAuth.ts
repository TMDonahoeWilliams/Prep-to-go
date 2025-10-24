import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // One-time cleanup of demo data on app startup
  useEffect(() => {
    const cleanupDemoData = () => {
      const currentVersion = '2.0.0'; // Version to force clear old data
      const storedVersion = localStorage.getItem('appVersion');
      
      // Force clear if version doesn't match (new deployment)
      if (storedVersion !== currentVersion) {
        console.log('useAuth: New app version detected, clearing all demo data');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('paymentStatus');
        localStorage.setItem('appVersion', currentVersion);
        return;
      }
      
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Check for any demo data patterns and clear them
          if (parsedUser.firstName === 'Demo' || 
              parsedUser.lastName === 'User' ||
              parsedUser.email === 'demo@collegeprep.app' ||
              parsedUser.id?.includes('demo-user')) {
            console.log('useAuth: Clearing demo data on startup');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
          }
        } catch (error) {
          // Invalid JSON, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
        }
      }
    };
    
    cleanupDemoData();
  }, []); // Run only once on mount

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
