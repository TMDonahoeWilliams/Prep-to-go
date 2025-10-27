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
      if ((!tasks || tasks.length === 0) && tasksSeeded !== 'true') {
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
    mutationFn: async (data: z.infer<typeof insertTaskSchema> & { helpfulLink?: string }) => {
      // Check if we're using localStorage-based tasks
      const userTasks = localStorage.getItem('userTasks');
      const tasksSeeded = localStorage.getItem('tasksSeeded');
      const user = localStorage.getItem('user');
      
      if (userTasks && tasksSeeded === 'true' && user) {
        // Create localStorage-based task
        try {
          const tasks = JSON.parse(userTasks);
          const userData = JSON.parse(user);
          
          const newTask = {
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: userData.id,
            categoryId: data.categoryId,
            title: data.title,
            description: data.description || null,
            dueDate: data.dueDate || null,
            priority: data.priority || 'medium',
            status: data.status || 'pending',
            completedAt: null,
            notes: data.notes || null,
            assignedTo: data.assignedTo || 'student',
            helpfulLink: data.helpfulLink || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: tasks.find((t: any) => t.category.id === data.categoryId)?.category || {
              id: data.categoryId,
              name: 'Custom Category',
              description: 'User created category',
              color: 'chart-1',
              icon: 'FileText',
              sortOrder: 999,
              createdAt: new Date().toISOString(),
            }
          };
          
          tasks.push(newTask);
          localStorage.setItem('userTasks', JSON.stringify(tasks));
          
          return newTask;
        } catch (error) {
          console.error('Failed to create localStorage task:', error);
          throw error;
        }
      } else {
        // Fall back to API-based create
        return await apiRequest("/api/tasks", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
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
      // Check if we're using localStorage-based tasks
      const userTasks = localStorage.getItem('userTasks');
      const tasksSeeded = localStorage.getItem('tasksSeeded');
      
      if (userTasks && tasksSeeded === 'true') {
        // Update localStorage-based task
        try {
          const tasks = JSON.parse(userTasks);
          const taskIndex = tasks.findIndex((task: any) => task.id === id);
          
          if (taskIndex === -1) {
            throw new Error('Task not found');
          }
          
          // Update the task while preserving existing fields
          const updatedTask = {
            ...tasks[taskIndex],
            ...data,
            updatedAt: new Date().toISOString(),
            // Handle completion timestamp
            completedAt: data.status === 'completed' 
              ? (tasks[taskIndex].completedAt || new Date().toISOString())
              : (data.status === 'pending' ? null : tasks[taskIndex].completedAt)
          };
          
          tasks[taskIndex] = updatedTask;
          localStorage.setItem('userTasks', JSON.stringify(tasks));
          
          return updatedTask;
        } catch (error) {
          console.error('Failed to update localStorage task:', error);
          throw error;
        }
      } else {
        // Fall back to API-based update
        return await apiRequest(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      }
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
      // Check if we're using localStorage-based tasks
      const userTasks = localStorage.getItem('userTasks');
      const tasksSeeded = localStorage.getItem('tasksSeeded');
      
      if (userTasks && tasksSeeded === 'true') {
        // Delete localStorage-based task
        try {
          const tasks = JSON.parse(userTasks);
          const filteredTasks = tasks.filter((task: any) => task.id !== id);
          
          if (filteredTasks.length === tasks.length) {
            throw new Error('Task not found');
          }
          
          localStorage.setItem('userTasks', JSON.stringify(filteredTasks));
          return { success: true };
        } catch (error) {
          console.error('Failed to delete localStorage task:', error);
          throw error;
        }
      } else {
        // Fall back to API-based delete
        return await apiRequest(`/api/tasks/${id}`, {
          method: "DELETE",
        });
      }
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
        const errorText = await response.text();
        console.error('Task seeding failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: '/api/tasks/seed',
          userId
        });
        throw new Error(`Failed to seed tasks: ${response.status} ${response.statusText} - ${errorText}`);
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
