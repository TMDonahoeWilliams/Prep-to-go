import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Category } from "@shared/schema";
import { z } from "zod";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";

type TaskWithCategory = Task & { category: Category | null };

export function useTasks() {
  return useQuery<TaskWithCategory[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      // First check if we have user-specific tasks in localStorage (from seeding)
      const userTasks = localStorage.getItem('userTasks');
      const tasksSeeded = localStorage.getItem('tasksSeeded');
      
      if (userTasks && tasksSeeded === 'true') {
        try {
          const tasks = JSON.parse(userTasks);
          console.log('Using seeded tasks from localStorage:', tasks.length);
          return tasks;
        } catch (error) {
          console.error('Failed to parse user tasks from localStorage:', error);
        }
      }

      // Fall back to API if no local tasks
      console.log('No local tasks found, fetching from API');
      const response = await fetch('/api/tasks', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const tasks = await response.json();
      
      // Mark that this user needs task seeding if they have no tasks and haven't been seeded
      if ((!tasks || tasks.length === 0) && !tasksSeeded) {
        console.log('No tasks found and not seeded - marking for task seeding');
        localStorage.setItem('needsTaskSeeding', 'true');
      }
      
      return tasks;
    },
  });
}

export function useTaskStats() {
  return useQuery<{
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
  }>({
    queryKey: ["/api/tasks/stats"],
  });
}

export function useCreateTask() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof insertTaskSchema>) => {
      return await apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useUpdateTask() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof updateTaskSchema> }) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useDeleteTask() {
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}

export function useSeedTasks() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch('/api/tasks/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to seed tasks');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Store seeded tasks in localStorage
      localStorage.setItem('userTasks', JSON.stringify(data.tasks || []));
      localStorage.setItem('tasksSeeded', 'true');
      localStorage.removeItem('needsTaskSeeding');
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
    },
  });
}
