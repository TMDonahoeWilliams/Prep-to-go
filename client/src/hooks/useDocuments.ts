import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Document } from "@shared/schema";
import { z } from "zod";
import { insertDocumentSchema, updateDocumentSchema } from "@shared/schema";

export function useDocuments() {
  return useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
}

export function useCreateDocument() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertDocumentSchema>) => {
      return await apiRequest("/api/documents", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}

export function useUpdateDocument() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof updateDocumentSchema> }) => {
      return await apiRequest(`/api/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/documents/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });
}
