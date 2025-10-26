import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { useAuth } from "./useAuth";

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type Category = Database['public']['Tables']['categories']['Row'];

type TaskWithCategory = Task & { category: Category };

export function useTasksSupabase() {
  const { user } = useAuth();
  
  return useQuery<TaskWithCategory[]>({
    queryKey: ["tasks", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      if (!isSupabaseConfigured() || !supabase) throw new Error("Supabase not configured");

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaskWithCategory[];
    },
    enabled: !!user?.id && isSupabaseConfigured(),
  });
}

export function useCreateTaskSupabase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<TaskInsert, 'user_id'>) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...data, user_id: user.id })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTaskSupabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskUpdate }) => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTaskSupabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useSeedTasksSupabase() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get default tasks for the user
      const defaultTasks = getDefaultTasksForUser(user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(defaultTasks.map(task => ({
          user_id: user.id,
          category_id: task.categoryId,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          priority: task.priority,
          status: task.status,
          notes: task.notes,
          assigned_to: task.assignedTo,
          helpful_link: (task as any).helpfulLink,
        })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Helper function to generate default tasks (same as your existing one)
function getDefaultTasksForUser(userId: string) {
  return [
    {
      id: `fafsa-1-${userId}`,
      userId,
      categoryId: 'cat-2',
      title: '🚨 Complete FAFSA Application',
      description: 'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible.',
      dueDate: '2026-01-01T23:59:00Z',
      priority: 'urgent' as const,
      status: 'pending' as const,
      completedAt: null,
      notes: 'Early submission recommended for maximum aid eligibility.',
      assignedTo: 'parent' as const,
      helpfulLink: 'https://studentaid.gov/h/apply-for-aid/fafsa',
    },
    // Add more default tasks here...
  ];
}