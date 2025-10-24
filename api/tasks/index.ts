import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Task schemas
const insertTaskSchema = z.object({
  categoryId: z.string(),
  title: z.string().max(200),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  notes: z.string().optional(),
  assignedTo: z.enum(['student', 'parent']).default('student'),
});

// Sample task data for demo (in production, this would come from database)
const sampleTasks = [
  {
    id: 'task-1',
    userId: 'demo-user',
    categoryId: 'cat-1',
    title: 'Submit Common Application',
    description: 'Complete and submit the common application for all selected colleges',
    dueDate: '2025-01-15T23:59:00Z',
    priority: 'high',
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
  },
  {
    id: 'task-2',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: 'Complete FAFSA',
    description: 'Fill out and submit the Free Application for Federal Student Aid',
    dueDate: '2025-03-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: null,
    assignedTo: 'parent',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: '2024-10-20T00:00:00Z',
    },
  },
  {
    id: 'task-3',
    userId: 'demo-user',
    categoryId: 'cat-3',
    title: 'Submit Housing Application',
    description: 'Apply for on-campus housing and select preferred dorms',
    dueDate: '2025-05-01T23:59:00Z',
    priority: 'medium',
    status: 'pending',
    completedAt: null,
    notes: null,
    assignedTo: 'student',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    category: {
      id: 'cat-3',
      name: 'Housing & Registration',
      description: 'Dorm selection, course registration, and orientation',
      color: 'chart-3',
      icon: 'Home',
      sortOrder: 3,
      createdAt: '2024-10-20T00:00:00Z',
    },
  },
  {
    id: 'task-4',
    userId: 'demo-user',
    categoryId: 'cat-4',
    title: 'Send Final Transcripts',
    description: 'Request and send final high school transcripts to colleges',
    dueDate: '2025-06-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: null,
    assignedTo: 'student',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    category: {
      id: 'cat-4',
      name: 'Testing & Transcripts',
      description: 'SAT/ACT scores, transcripts, and test prep',
      color: 'chart-4',
      icon: 'GraduationCap',
      sortOrder: 4,
      createdAt: '2024-10-20T00:00:00Z',
    },
  },
  {
    id: 'task-5',
    userId: 'demo-user',
    categoryId: 'cat-5',
    title: 'Complete Health Forms',
    description: 'Submit immunization records and health insurance information',
    dueDate: '2025-07-01T23:59:00Z',
    priority: 'medium',
    status: 'in_progress',
    completedAt: null,
    notes: 'Health center appointment scheduled for next week',
    assignedTo: 'parent',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-22T00:00:00Z',
    category: {
      id: 'cat-5',
      name: 'Health & Documentation',
      description: 'Immunizations, insurance, and medical records',
      color: 'chart-5',
      icon: 'Heart',
      sortOrder: 5,
      createdAt: '2024-10-20T00:00:00Z',
    },
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // For demo purposes, we'll return sample tasks
    // In production, you'd check authentication and query the database

    // GET /api/tasks - Get all user tasks with categories
    if (req.method === 'GET') {
      return res.status(200).json(sampleTasks);
    }

    // POST /api/tasks - Create new task
    if (req.method === 'POST') {
      const validated = insertTaskSchema.parse(req.body);
      
      // Create a new task ID
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Find the category for the new task
      const category = sampleTasks.find(t => t.categoryId === validated.categoryId)?.category || {
        id: validated.categoryId,
        name: 'Custom Category',
        description: 'User created category',
        color: 'chart-1',
        icon: 'FileText',
        sortOrder: 999,
        createdAt: new Date().toISOString(),
      };

      const newTask = {
        id: newTaskId,
        userId: 'demo-user',
        categoryId: validated.categoryId,
        title: validated.title,
        description: validated.description || null,
        dueDate: validated.dueDate || null,
        priority: validated.priority || 'medium',
        status: validated.status || 'pending',
        completedAt: null,
        notes: validated.notes || null,
        assignedTo: validated.assignedTo || 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category,
      };

      return res.status(201).json(newTask);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Tasks API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors 
      });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}