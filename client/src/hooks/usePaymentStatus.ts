import { useQuery } from "@tanstack/react-query";

export function usePaymentStatus() {
  return useQuery({
    queryKey: ["/api/payments/check-access"],
    queryFn: async () => {
      const response = await fetch("/api/payments/check-access", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}