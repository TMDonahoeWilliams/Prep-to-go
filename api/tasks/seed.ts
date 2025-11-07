import type { VercelRequest, VercelResponse } from '@vercel/node';

// Supabase Category UUIDs (from actual database)
const SUPABASE_CATEGORY_IDS = {
  'College Applications': 'df6a446f-ab40-49ac-845f-9fc7c192a000',
  'Financial Aid & FAFSA': 'c1a83e9c-8619-48be-a76c-997a6579c000',
  'Housing & Registration': '8ee12cdc-45aa-409c-bcf4-a69167a0859e',
  'Testing & Transcripts': 'a807e9bc-133b-4b8c-aad6-e513ff16bf4c',
  'Health & Documentation': '5a20dd15-4d99-457e-9313-af22d3e6ae00',
  'Move-In Preparation': '3b871a7d-31a5-4385-b21c-a14bf239ffeb'
} as const;

const getDefaultTasksForUser = (userId: string) => [
  {
    id: `fafsa-1-${userId}`,
    userId,
    categoryId: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    title: '🚨 Complete FAFSA Application',
    description: 'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible. Federal deadline is June 30, but state and college deadlines are much earlier.',
    dueDate: '2026-01-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Early submission recommended for maximum aid eligibility. Need tax documents from parents.',
    assignedTo: 'parent',
    helpfulLink: 'https://studentaid.gov/h/apply-for-aid/fafsa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    title: 'CSS Profile Application',
    description: 'Complete CSS Profile for private colleges and additional aid programs',
    dueDate: '2026-01-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Required by many private colleges. Check college-specific deadlines.',
    assignedTo: 'parent',
    helpfulLink: 'https://cssprofile.collegeboard.org/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `early-apps-${userId}`,
    userId,
    categoryId: SUPABASE_CATEGORY_IDS['College Applications'],
    title: 'Early Decision/Action Applications',
    description: 'Submit early decision and early action applications for priority consideration',
    dueDate: '2025-11-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: "ED is binding, EA is not. Check each school's specific requirements.",
    assignedTo: 'student',
    helpfulLink: 'https://www.commonapp.org/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['College Applications'],
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
    categoryId: SUPABASE_CATEGORY_IDS['College Applications'],
    title: 'Common Application Deadline',
    description: 'Submit Common Application for regular decision to all selected colleges',
    dueDate: '2026-01-01T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges use Common App. Check for any school-specific supplements.',
    assignedTo: 'student',
    helpfulLink: 'https://www.commonapp.org/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['College Applications'],
      name: 'College Applications',
      description: 'College application deadlines and requirements',
      color: 'chart-1',
      icon: 'GraduationCap',
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `merit-scholar-${userId}`,
    userId,
    categoryId: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    title: '💰 National Merit Scholarship',
    description: 'Complete National Merit Scholarship application if semi-finalist',
    dueDate: '2026-02-15T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Only for PSAT National Merit Semi-finalists. Up to $2,500 award. Extended deadline for 2026 graduates.',
    assignedTo: 'student',
    helpfulLink: 'https://www.nationalmerit.org/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    title: '💰 Coca-Cola Scholars Program',
    description: 'Apply for $20,000 Coca-Cola Scholars Program scholarship',
    dueDate: '2026-01-31T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'Leadership and academic excellence. 150 winners annually. Must be high school senior.',
    assignedTo: 'student',
    helpfulLink: 'https://www.coca-colascholarsfoundation.org/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    title: '💰 Jack Kent Cooke Foundation Scholarship',
    description: 'Apply for Jack Kent Cooke Foundation College Scholarship (up to $55,000/year)',
    dueDate: '2026-11-15T23:59:00Z',
    priority: 'urgent',
    status: 'pending',
    completedAt: null,
    notes: 'High-achieving students with financial need. Must have 3.5+ GPA and demonstrate leadership.',
    assignedTo: 'student',
    helpfulLink: 'https://www.jkcf.org/our-scholarships/college-scholarship-program/',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
      name: 'Financial Aid & FAFSA',
      description: 'Financial aid forms, scholarships, and FAFSA submission',
      color: 'chart-2',
      icon: 'DollarSign',
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `send-scores-${userId}`,
    userId,
    categoryId: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
    title: 'Send SAT/ACT Scores',
    description: 'Send official test scores to all colleges on your list',
    dueDate: '2025-12-15T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Order through College Board (SAT) or ACT.org. Allow 2-3 weeks for delivery.',
    assignedTo: 'student',
    helpfulLink: 'https://www.collegeboard.org/send-scores',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
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
      id: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
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
      id: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
      name: 'Testing & Transcripts',
      description: 'Standardized tests, transcripts, and academic records',
      color: 'chart-4',
      icon: 'BookOpen',
      sortOrder: 4,
      createdAt: new Date().toISOString(),
    },
  },
  {
    id: `housing-deposit-${userId}`,
    userId,
    categoryId: SUPABASE_CATEGORY_IDS['Housing & Registration'],
    title: 'Housing Application Deposit',
    description: 'Submit housing application and deposit to secure on-campus housing',
    dueDate: '2026-05-01T23:59:00Z',
    priority: 'high',
    status: 'pending',
    completedAt: null,
    notes: 'Most colleges require housing deposit by May 1st. Usually $200-500.',
    assignedTo: 'parent',
    helpfulLink: 'https://bigfuture.collegeboard.org/plan-for-college/college-basics/applying-to-college/college-application-checklist',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
      id: SUPABASE_CATEGORY_IDS['Housing & Registration'],
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
    categoryId: SUPABASE_CATEGORY_IDS['Health & Documentation'],
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
      id: SUPABASE_CATEGORY_IDS['Health & Documentation'],
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
    // CORS + preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Prefer session userId when available (server-backed). Fall back to body.userId.
    const sessionUserId = (req as any)?.session?.userId;
    const bodyUserId = req.body?.userId;
    const userId = sessionUserId || bodyUserId;

    if (!userId) {
      console.warn('No userId found in session or request body for /api/tasks/seed');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Seeding default tasks for user: ${userId} (sessionUserId: ${!!sessionUserId})`);

    const defaultTasks = getDefaultTasksForUser(userId);

    // Attempt to persist via server storage API; dynamic import so this endpoint still works in serverless/demo.
    try {
      const { storage } = await import('../../server/storage') as any;

      if (!storage || typeof storage.getUserTasks !== 'function' || typeof storage.createTask !== 'function') {
        throw new Error('Storage interface not available or incomplete');
      }

      // If user already has tasks, do not seed (idempotent)
      const existingTasks = await storage.getUserTasks(userId);
      if (existingTasks && existingTasks.length > 0) {
        console.log(`User ${userId} already has ${existingTasks.length} tasks; skipping DB seed`);
        return res.status(200).json({
          success: true,
          message: `User already has ${existingTasks.length} tasks; no seed performed`,
          tasks: existingTasks,
          persisted: true,
          userId,
        });
      }

      console.log(`Persisting ${defaultTasks.length} default tasks for user ${userId} via storage.createTask`);
      const insertedTasks: any[] = [];

      for (const t of defaultTasks) {
        try {
          // storage.createTask expects the insert shape used by the server; pass fields as-is
          const created = await storage.createTask({
            id: t.id,
            userId: t.userId,
            categoryId: t.categoryId,
            title: t.title,
            description: t.description,
            dueDate: t.dueDate,
            priority: t.priority,
            status: t.status,
            completedAt: t.completedAt,
            notes: t.notes,
            assignedTo: t.assignedTo,
            helpfulLink: (t as any).helpfulLink || null,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          });
          insertedTasks.push(created);
        } catch (perTaskErr) {
          console.error('Failed to persist task', t.id, perTaskErr);
          // continue with remaining tasks (don't fail entire seed for one bad row)
        }
      }

      console.log(`Inserted ${insertedTasks.length} tasks for user ${userId}`);
      return res.status(200).json({
        success: true,
        message: `Seeded ${insertedTasks.length} tasks (persisted)`,
        tasks: insertedTasks,
        persisted: true,
        userId,
      });
    } catch (persistErr) {
      console.warn('DB persistence not available or failed, falling back to returning tasks for client storage:', persistErr);
      // Return generated tasks so client can store in localStorage (demo mode)
      return res.status(200).json({
        success: true,
        message: `Generated ${defaultTasks.length} default tasks (client-side storage recommended)`,
        tasks: defaultTasks,
        persisted: false,
        userId,
      });
    }
  } catch (error) {
    console.error('Task seeding error:', error);
    return res.status(500).json({
      error: 'Failed to seed tasks',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
