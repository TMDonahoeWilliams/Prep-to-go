import type { VercelRequest, VercelResponse } from '@vercel/node';

// Default tasks that every new user should have (using realistic 2026-2027 deadlines)
const getDefaultTasksForUser = (userId: string) => [
  // FAFSA and Financial Aid (Critical Timeline)
  {
    id: `fafsa-1-${userId}`,
    userId,
    categoryId: 'cat-2',
    title: '🚨 Complete FAFSA Application',
    description: 'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible. Federal deadline is June 30, but state and college deadlines are much earlier.',
    dueDate: '2026-01-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Early submission recommended for maximum aid eligibility. Need tax documents from parents.',
    assignedTo: 'parent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `css-profile-${userId}`,
    userId,
    categoryId: 'cat-2',
    title: 'CSS Profile Application',
    description: 'Complete CSS Profile for private colleges and additional aid programs',
    dueDate: '2026-02-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Required by many private colleges. Check each school\'s specific deadline.',
    assignedTo: 'parent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },

  // College Application Deadlines
  {
    id: `early-apps-${userId}`,
    userId,
    categoryId: 'cat-1',
    title: 'Early Decision/Action Applications',
    description: 'Submit early decision and early action applications for priority consideration',
    dueDate: '2025-11-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'ED is binding, EA is not. Check each school\'s specific requirements.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-1',
      name: 'College Applications',
      description: 'College application deadlines and requirements',
      color: 'chart-1',
      icon: 'GraduationCap',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `common-app-${userId}`,
    userId,
    categoryId: 'cat-1',
    title: 'Common Application Deadline',
    description: 'Submit Common Application for regular decision to all selected colleges',
    dueDate: '2026-01-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges use Common App. Check for any school-specific supplements.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-1',
      name: 'College Applications',
      description: 'College application deadlines and requirements',
      color: 'chart-1',
      icon: 'GraduationCap',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
  },

  // Major Scholarships
  {
    id: `merit-scholar-${userId}`,
    userId,
    categoryId: 'cat-2',
    title: '💰 National Merit Scholarship',
    description: 'Complete National Merit Scholarship application if semi-finalist',
    dueDate: '2026-02-15T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Only for PSAT National Merit Semi-finalists. Up to $2,500 award. Extended deadline for 2026 graduates.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `coca-cola-${userId}`,
    userId,
    categoryId: 'cat-2',
    title: '💰 Coca-Cola Scholars Program',
    description: 'Apply for $20,000 Coca-Cola Scholars Program scholarship',
    dueDate: '2026-01-31T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Leadership and academic excellence. 150 winners annually. Must be high school senior.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `cooke-foundation-${userId}`,
    userId,
    categoryId: 'cat-2',
    title: '💰 Jack Kent Cooke Foundation Scholarship',
    description: 'Apply for Jack Kent Cooke Foundation College Scholarship (up to $55,000/year)',
    dueDate: '2026-11-15T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'High-achieving students with financial need. Must have 3.5+ GPA and demonstrate leadership.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-2',
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },

  // Testing and Transcripts
  {
    id: `send-scores-${userId}`,
    userId,
    categoryId: 'cat-4',
    title: 'Send SAT/ACT Scores',
    description: 'Send official test scores to all colleges on your list',
    dueDate: '2025-12-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Order through College Board (SAT) or ACT.org. Allow 2-3 weeks for delivery.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-4',
      name: 'Testing & Transcripts',
      description: 'Standardized tests, transcripts, and academic records',
      color: 'chart-4',
      icon: 'BookOpen',
      sortOrder: 4,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `request-transcripts-${userId}`,
    userId,
    categoryId: 'cat-4',
    title: 'Request High School Transcripts',
    description: 'Request official transcripts from high school for all college applications',
    dueDate: '2025-12-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Contact guidance counselor early. Some schools need 2+ weeks processing time.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-4',
      name: 'Testing & Transcripts',
      description: 'Standardized tests, transcripts, and academic records',
      color: 'chart-4',
      icon: 'BookOpen',
      sortOrder: 4,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `final-transcript-${userId}`,
    userId,
    categoryId: 'cat-4',
    title: 'Final Transcript After Graduation',
    description: 'Send final high school transcript to enrolled college',
    dueDate: '2026-07-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'CRITICAL: Required for enrollment. Must show graduation and final grades.',
    assignedTo: 'student',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-4',
      name: 'Testing & Transcripts',
      description: 'Standardized tests, transcripts, and academic records',
      color: 'chart-4',
      icon: 'BookOpen',
      sortOrder: 4,
      createdAt: new Date().toISOString(),
    },
  },

  // Housing and Health
  {
    id: `housing-deposit-${userId}`,
    userId,
    categoryId: 'cat-3',
    title: 'Housing Application Deposit',
    description: 'Submit housing application and deposit to secure on-campus housing',
    dueDate: '2026-05-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges require housing deposit by May 1st. Usually $200-500.',
    assignedTo: 'parent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-3',
      name: 'Housing & Registration',
      description: 'Dorm applications, course registration, and enrollment',
      color: 'chart-3',
      icon: 'Home',
      sortOrder: 3,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `immunizations-${userId}`,
    userId,
    categoryId: 'cat-5',
    title: 'Immunization Records',
    description: 'Submit required immunization records to college health center',
    dueDate: '2026-07-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Required for enrollment. May need additional vaccines like meningitis.',
    assignedTo: 'parent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: 'cat-5',
      name: 'Health & Documentation',
      description: 'Medical forms, insurance, and health requirements',
      color: 'chart-5',
      icon: 'Heart',
      sortOrder: 5,
      createdAt: new Date().toISOString(),
    },
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // Only handle POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Seeding default tasks for user: ${userId}`);
    
    // For serverless demo, we'll store tasks in localStorage via the client
    // Generate the default tasks for this user
    const defaultTasks = getDefaultTasksForUser(userId);
    
    console.log(`Generated ${defaultTasks.length} default tasks for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: `Successfully generated ${defaultTasks.length} default tasks`,
      tasks: defaultTasks,
      userId: userId
    });

  } catch (error) {
    console.error('Task seeding error:', error);
    return res.status(500).json({ 
      error: 'Failed to seed tasks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}