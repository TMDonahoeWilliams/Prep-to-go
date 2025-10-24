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

// Comprehensive default tasks for college prep (realistic deadlines for 2025-2026 academic year)
const defaultTasks = [
  // FAFSA and Financial Aid (Critical Timeline)
  {
    id: 'fafsa-1',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: '🚨 Complete FAFSA Application',
    description: 'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible. Federal deadline is June 30, but state and college deadlines are much earlier.',
    dueDate: '2025-01-01T23:59:00Z', // Priority deadline for most states
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Early submission recommended for maximum aid eligibility. Need tax documents from parents.',
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
    id: 'fafsa-2',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: 'CSS Profile Application',
    description: 'Complete CSS Profile for private colleges and additional aid programs',
    dueDate: '2025-02-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Required by many private colleges. Check each school\'s specific deadline.',
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

  // College Application Deadlines
  {
    id: 'app-1',
    userId: 'demo-user',
    categoryId: 'cat-1',
    title: 'Early Decision/Action Applications',
    description: 'Submit early decision and early action applications for priority consideration',
    dueDate: '2024-11-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'ED is binding, EA is not. Check each school\'s specific requirements.',
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
    id: 'app-2',
    userId: 'demo-user',
    categoryId: 'cat-1',
    title: 'Common Application Deadline',
    description: 'Submit Common Application for regular decision to all selected colleges',
    dueDate: '2025-01-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges use Common App. Check for any school-specific supplements.',
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
    id: 'app-3',
    userId: 'demo-user',
    categoryId: 'cat-1',
    title: 'UC System Application',
    description: 'Submit University of California application (if applying to CA schools)',
    dueDate: '2024-11-30T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'All UC schools use the same application. No letters of recommendation required.',
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

  // Scholarship Deadlines
  {
    id: 'scholar-1',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: 'National Merit Scholarship',
    description: 'Complete National Merit Scholarship application if semi-finalist',
    dueDate: '2024-10-15T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Only for PSAT National Merit Semi-finalists. Up to $2,500 award.',
    assignedTo: 'student',
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
    id: 'scholar-2',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: 'State Grant Applications',
    description: 'Apply for state-specific grant programs (varies by state)',
    dueDate: '2025-03-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Check your state\'s grant programs. Many require separate applications beyond FAFSA.',
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
    id: 'scholar-3',
    userId: 'demo-user',
    categoryId: 'cat-2',
    title: 'Local Scholarship Applications',
    description: 'Research and apply for local community, business, and organization scholarships',
    dueDate: '2025-04-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Check with high school counselor for local opportunities. Less competition than national scholarships.',
    assignedTo: 'student',
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

  // Testing and Transcripts
  {
    id: 'test-1',
    userId: 'demo-user',
    categoryId: 'cat-4',
    title: 'Send SAT/ACT Scores',
    description: 'Send official test scores to all colleges on your list',
    dueDate: '2024-12-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Order through College Board (SAT) or ACT.org. Allow 2-3 weeks for delivery.',
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
    id: 'test-2',
    userId: 'demo-user',
    categoryId: 'cat-4',
    title: 'Request High School Transcripts',
    description: 'Request official transcripts from high school for all college applications',
    dueDate: '2024-12-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Contact guidance counselor early. Some schools need 2+ weeks processing time.',
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
    id: 'test-3',
    userId: 'demo-user',
    categoryId: 'cat-4',
    title: 'Final Transcript After Graduation',
    description: 'Send final high school transcript to enrolled college',
    dueDate: '2025-07-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'CRITICAL: Required for enrollment. Must show graduation and final grades.',
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

  // Housing and Registration
  {
    id: 'housing-1',
    userId: 'demo-user',
    categoryId: 'cat-3',
    title: 'Housing Application Deposit',
    description: 'Submit housing application and deposit to secure on-campus housing',
    dueDate: '2025-05-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges require housing deposit by May 1st. Usually $200-500.',
    assignedTo: 'parent',
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
    id: 'housing-2',
    userId: 'demo-user',
    categoryId: 'cat-3',
    title: 'Course Registration',
    description: 'Register for fall semester courses during orientation or registration period',
    dueDate: '2025-07-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Meet with academic advisor first. Popular classes fill up quickly.',
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

  // Health and Documentation
  {
    id: 'health-1',
    userId: 'demo-user',
    categoryId: 'cat-5',
    title: 'Immunization Records',
    description: 'Submit required immunization records to college health center',
    dueDate: '2025-07-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Required for enrollment. May need additional vaccines like meningitis.',
    assignedTo: 'parent',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
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
  {
    id: 'health-2',
    userId: 'demo-user',
    categoryId: 'cat-5',
    title: 'Health Insurance Information',
    description: 'Submit health insurance waiver or enroll in college plan',
    dueDate: '2025-08-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Can waive if covered by parent plan. College plans are typically more expensive.',
    assignedTo: 'parent',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
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

  // Move-In Preparation
  {
    id: 'move-1',
    userId: 'demo-user',
    categoryId: 'cat-6',
    title: 'College Packing List',
    description: 'Create and shop for college packing list essentials',
    dueDate: '2025-08-01T23:59:00Z',
    priority: 'medium',
    status: 'pending',
    completedAt: null,
    notes: 'Check college\'s provided list. Coordinate with roommate to avoid duplicates.',
    assignedTo: 'student',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    category: {
      id: 'cat-6',
      name: 'Move-In Preparation',
      description: 'Packing, shopping, and logistics for move-in',
      color: 'primary',
      icon: 'Package',
      sortOrder: 6,
      createdAt: '2024-10-20T00:00:00Z',
    },
  },
  {
    id: 'move-2',
    userId: 'demo-user',
    categoryId: 'cat-6',
    title: 'Move-In Day Logistics',
    description: 'Plan travel, book hotels, and prepare for move-in day',
    dueDate: '2025-08-15T23:59:00Z',
    priority: 'medium',
    status: 'pending',
    completedAt: null,
    notes: 'Book hotels early - move-in weekends fill up fast. Check college move-in schedule.',
    assignedTo: 'parent',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-10-20T00:00:00Z',
    category: {
      id: 'cat-6',
      name: 'Move-In Preparation',
      description: 'Packing, shopping, and logistics for move-in',
      color: 'primary',
      icon: 'Package',
      sortOrder: 6,
      createdAt: '2024-10-20T00:00:00Z',
    },
  }
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
      return res.status(200).json(defaultTasks);
    }

    // POST /api/tasks - Create new task
    if (req.method === 'POST') {
      const validated = insertTaskSchema.parse(req.body);
      
      // Create a new task ID
      const newTaskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Find the category for the new task
      const category = defaultTasks.find((t: any) => t.categoryId === validated.categoryId)?.category || {
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