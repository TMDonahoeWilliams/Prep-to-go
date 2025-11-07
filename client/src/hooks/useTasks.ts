import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/api"; // if you have a wrapper; otherwise use fetch
import { useAuth } from "./useAuth";

// For brevity this file shows the main logic only: prefer server, fallback to localStorage on network errors.

export function useTasks() {
  return useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      // Try server first
      try {
        const response = await fetch('/api/tasks', { credentials: 'include' });
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        const tasks = await response.json();
        // When server returns tasks, keep localStorage in sync (optional)
        try {
          localStorage.setItem('userTasks', JSON.stringify(tasks));
          localStorage.setItem('tasksSeeded', 'true');
        } catch (e) { /* ignore localStorage failures */ }
        return tasks;
      } catch (serverErr) {
        console.warn('Server /api/tasks failed, falling back to localStorage:', serverErr);
        // If server unavailable, try localStorage (old demo behavior)
        const userTasks = localStorage.getItem('userTasks');
        const tasksSeeded = localStorage.getItem('tasksSeeded');
        if (userTasks && tasksSeeded === 'true') {
          try {
            const tasks = JSON.parse(userTasks);
            return tasks;
          } catch (err) {
            console.error('Failed to parse userTasks from localStorage:', err);
          }
        }
        // No tasks available
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      // Try server API
      try {
        const resp = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
        const created = await resp.json();
        return created;
      } catch (serverErr) {
        console.warn('Create task API failed, falling back to localStorage:', serverErr);
        // Fallback: persist to localStorage (demo mode)
        const userTasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        const newTask = {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
          userId: user?.id,
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
        };
        userTasks.unshift(newTask);
        localStorage.setItem('userTasks', JSON.stringify(userTasks));
        localStorage.setItem('tasksSeeded', 'true');
        return newTask;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        const resp = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(data),
        });
        if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
        return await resp.json();
      } catch (serverErr) {
        console.warn('Update task API failed, falling back to localStorage:', serverErr);
        const tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        const idx = tasks.findIndex((t:any)=>t.id===id);
        if (idx !== -1) {
          tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
          localStorage.setItem('userTasks', JSON.stringify(tasks));
          return tasks[idx];
        }
        throw new Error('Task not found in localStorage');
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const resp = await fetch(`/api/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!resp.ok) throw new Error(`Server returned ${resp.status}`);
        return;
      } catch (serverErr) {
        console.warn('Delete task API failed, falling back to localStorage:', serverErr);
        const tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        const filtered = tasks.filter((t:any)=>t.id!==id);
        localStorage.setItem('userTasks', JSON.stringify(filtered));
        return;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tasks"] }),
  });
}
