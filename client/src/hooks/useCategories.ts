import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: true,
  });
}
