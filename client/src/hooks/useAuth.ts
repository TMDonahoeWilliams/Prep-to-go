import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedUser, setStoredUser] = useState(null);

  // Check localStorage on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setStoredUser(JSON.parse(userData));
    }
  }, []);

  const { data: apiUser, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
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
  };
}
