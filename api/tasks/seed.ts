// api/tasks/seed.ts
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
  // (include the same default task objects you already have)
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
  // ... rest of your tasks ...
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS + preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(200).json({ message: 'OK' });
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Prefer userId from session if present (server-backed); otherwise use body.userId
    const sessionUserId = (req as any)?.session?.userId;
    const bodyUserId = req.body?.userId;
    const userId = sessionUserId || bodyUserId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Seeding default tasks for user: ${userId} (sessionUserId: ${!!sessionUserId})`);

    const defaultTasks = getDefaultTasksForUser(userId);

    // Try to persist using the server-side seeding helper (DB-backed server). Use dynamic import so file still works in serverless/demo.
    try {
      const { seedDefaultTasksForUser } = await import('../../server/seedTasks');
      console.log('Attempting DB seed via server/seedTasks.seedDefaultTasksForUser...');
      await seedDefaultTasksForUser(userId);

      // Try returning persisted tasks (prefer storage if available)
      try {
        const { storage } = await import('../../server/storage') as any;
        const tasksPersisted = storage.getUserTasksWithCategories
          ? await storage.getUserTasksWithCategories(userId)
          : await storage.getUserTasks(userId);

        console.log(`Persisted ${Array.isArray(tasksPersisted) ? tasksPersisted.length : 'unknown'} tasks for user ${userId}`);
        return res.status(200).json({
          success: true,
          message: `Seeded ${Array.isArray(tasksPersisted) ? tasksPersisted.length : defaultTasks.length} tasks (persisted)`,
          tasks: tasksPersisted || defaultTasks,
          persisted: true,
          userId,
        });
      } catch (readbackErr) {
        console.warn('Seeded but could not read back persisted tasks:', readbackErr);
        return res.status(200).json({
          success: true,
          message: `Seeded ${defaultTasks.length} tasks (DB seed attempted)`,
          tasks: defaultTasks,
          persisted: true,
          userId,
        });
      }
    } catch (persistErr) {
      // Fall back to returning tasks for client to store locally (serverless/demo)
      console.warn('DB persistence not available or failed, falling back to returning tasks:', persistErr);
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
