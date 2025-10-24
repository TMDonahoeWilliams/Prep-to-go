import { useQuery } from "@tanstack/react-query";

export function usePaymentStatus() {
  return useQuery({
    queryKey: ["/api/payments/check-access"],
    queryFn: async () => {
      // First check localStorage for demo payment status
      const localPaymentStatus = localStorage.getItem('paymentStatus');
      if (localPaymentStatus) {
        try {
          const parsedStatus = JSON.parse(localPaymentStatus);
          if (parsedStatus.hasPaidAccess) {
            return parsedStatus;
          }
        } catch (error) {
          console.error('Failed to parse local payment status:', error);
        }
      }

      // If no local payment status, check API
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