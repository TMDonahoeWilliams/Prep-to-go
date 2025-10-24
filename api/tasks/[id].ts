import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Update task schema
const updateTaskSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  notes: z.string().optional(),
  assignedTo: z.enum(['student', 'parent']).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    // PATCH /api/tasks/[id] - Update task
    if (req.method === 'PATCH') {
      const validated = updateTaskSchema.parse(req.body);
      
      // In production, you'd update the task in the database
      // For demo, return a mock updated task
      const updatedTask = {
        id,
        userId: 'demo-user',
        categoryId: validated.categoryId || 'cat-1',
        title: validated.title || 'Updated Task',
        description: validated.description || null,
        dueDate: validated.dueDate || null,
        priority: validated.priority || 'medium',
        status: validated.status || 'pending',
        completedAt: validated.status === 'completed' ? new Date().toISOString() : null,
        notes: validated.notes || null,
        assignedTo: validated.assignedTo || 'student',
        createdAt: '2024-10-20T00:00:00Z',
        updatedAt: new Date().toISOString(),
        category: {
          id: 'cat-1',
          name: 'College Applications',
          description: 'Application submissions, essays, and deadlines',
          color: 'chart-1',
          icon: 'FileText',
          sortOrder: 1,
          createdAt: '2024-10-20T00:00:00Z',
        },
      };

      return res.status(200).json(updatedTask);
    }

    // DELETE /api/tasks/[id] - Delete task
    if (req.method === 'DELETE') {
      // In production, you'd delete the task from the database
      // For demo, just return success
      return res.status(204).end();
    }

    // GET /api/tasks/[id] - Get single task (optional)
    if (req.method === 'GET') {
      // Mock single task response
      const task = {
        id,
        userId: 'demo-user',
        categoryId: 'cat-1',
        title: 'Sample Task',
        description: 'This is a sample task',
        dueDate: '2025-01-15T23:59:00Z',
        priority: 'medium',
        status: 'pending',
        completedAt: null,
        notes: null,
        assignedTo: 'student',
        createdAt: '2024-10-20T00:00:00Z',
        updatedAt: '2024-10-20T00:00:00Z',
        category: {
          id: 'cat-1',
          name: 'College Applications',
          description: 'Application submissions, essays, and deadlines',
          color: 'chart-1',
          icon: 'FileText',
          sortOrder: 1,
          createdAt: '2024-10-20T00:00:00Z',
        },
      };

      return res.status(200).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Task API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}