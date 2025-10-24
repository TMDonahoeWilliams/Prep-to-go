// Seed default college prep tasks for new users
import { db } from "./db";
import { tasks, categories } from "@shared/schema";
import { eq } from "drizzle-orm";

// Default tasks that every new user should have
const getDefaultTasks = (userId: string, categoryMap: Record<string, string>) => [
  // FAFSA and Financial Aid (Critical Timeline)
  {
    userId,
    categoryId: categoryMap['Financial Aid & FAFSA'],
    title: '🚨 Complete FAFSA Application',
    description: 'Submit the Free Application for Federal Student Aid (FAFSA) as early as possible. Federal deadline is June 30, but state and college deadlines are much earlier.',
    dueDate: new Date('2026-01-01T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'Early submission recommended for maximum aid eligibility. Need tax documents from parents.',
    assignedTo: 'parent' as const,
  },
  {
    userId,
    categoryId: categoryMap['Financial Aid & FAFSA'],
    title: 'CSS Profile Application',
    description: 'Complete CSS Profile for private colleges and additional aid programs',
    dueDate: new Date('2026-02-01T23:59:00Z'),
    priority: 'high' as const,
    status: 'pending' as const,
    notes: 'Required by many private colleges. Check each school\'s specific deadline.',
    assignedTo: 'parent' as const,
  },

  // College Application Deadlines
  {
    userId,
    categoryId: categoryMap['College Applications'],
    title: 'Early Decision/Action Applications',
    description: 'Submit early decision and early action applications for priority consideration',
    dueDate: new Date('2025-11-01T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'ED is binding, EA is not. Check each school\'s specific requirements.',
    assignedTo: 'student' as const,
  },
  {
    userId,
    categoryId: categoryMap['College Applications'],
    title: 'Common Application Deadline',
    description: 'Submit Common Application for regular decision to all selected colleges',
    dueDate: new Date('2026-01-01T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'Most colleges use Common App. Check for any school-specific supplements.',
    assignedTo: 'student' as const,
  },

  // Major Scholarships
  {
    userId,
    categoryId: categoryMap['Financial Aid & FAFSA'],
    title: '💰 National Merit Scholarship',
    description: 'Complete National Merit Scholarship application if semi-finalist',
    dueDate: new Date('2025-10-15T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'Only for PSAT National Merit Semi-finalists. Up to $2,500 award.',
    assignedTo: 'student' as const,
  },
  {
    userId,
    categoryId: categoryMap['Financial Aid & FAFSA'],
    title: '💰 Coca-Cola Scholars Program',
    description: 'Apply for $20,000 Coca-Cola Scholars Program scholarship',
    dueDate: new Date('2025-10-31T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'Leadership and academic excellence. 150 winners annually. Must be high school senior.',
    assignedTo: 'student' as const,
  },
  {
    userId,
    categoryId: categoryMap['Financial Aid & FAFSA'],
    title: '💰 Jack Kent Cooke Foundation Scholarship',
    description: 'Apply for Jack Kent Cooke Foundation College Scholarship (up to $55,000/year)',
    dueDate: new Date('2025-11-15T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'High-achieving students with financial need. Must have 3.5+ GPA and demonstrate leadership.',
    assignedTo: 'student' as const,
  },

  // Testing and Transcripts
  {
    userId,
    categoryId: categoryMap['Testing & Transcripts'],
    title: 'Send SAT/ACT Scores',
    description: 'Send official test scores to all colleges on your list',
    dueDate: new Date('2025-12-15T23:59:00Z'),
    priority: 'high' as const,
    status: 'pending' as const,
    notes: 'Order through College Board (SAT) or ACT.org. Allow 2-3 weeks for delivery.',
    assignedTo: 'student' as const,
  },
  {
    userId,
    categoryId: categoryMap['Testing & Transcripts'],
    title: 'Request High School Transcripts',
    description: 'Request official transcripts from high school for all college applications',
    dueDate: new Date('2025-12-01T23:59:00Z'),
    priority: 'high' as const,
    status: 'pending' as const,
    notes: 'Contact guidance counselor early. Some schools need 2+ weeks processing time.',
    assignedTo: 'student' as const,
  },
  {
    userId,
    categoryId: categoryMap['Testing & Transcripts'],
    title: 'Final Transcript After Graduation',
    description: 'Send final high school transcript to enrolled college',
    dueDate: new Date('2026-07-01T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'CRITICAL: Required for enrollment. Must show graduation and final grades.',
    assignedTo: 'student' as const,
  },

  // Housing and Health
  {
    userId,
    categoryId: categoryMap['Housing & Registration'],
    title: 'Housing Application Deposit',
    description: 'Submit housing application and deposit to secure on-campus housing',
    dueDate: new Date('2026-05-01T23:59:00Z'),
    priority: 'high' as const,
    status: 'pending' as const,
    notes: 'Most colleges require housing deposit by May 1st. Usually $200-500.',
    assignedTo: 'parent' as const,
  },
  {
    userId,
    categoryId: categoryMap['Health & Documentation'],
    title: 'Immunization Records',
    description: 'Submit required immunization records to college health center',
    dueDate: new Date('2026-07-01T23:59:00Z'),
    priority: 'urgent' as const,
    status: 'pending' as const,
    notes: 'Required for enrollment. May need additional vaccines like meningitis.',
    assignedTo: 'parent' as const,
  },
];

export async function seedDefaultTasksForUser(userId: string) {
  try {
    console.log(`Seeding default tasks for user: ${userId}`);
    
    // Check if user already has tasks
    const existingTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
    if (existingTasks.length > 0) {
      console.log(`User ${userId} already has ${existingTasks.length} tasks, skipping seed`);
      return;
    }

    // Get category mapping
    const categoriesData = await db.select().from(categories);
    const categoryMap: Record<string, string> = {};
    categoriesData.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Create default tasks
    const defaultTasks = getDefaultTasks(userId, categoryMap);
    
    for (const task of defaultTasks) {
      await db.insert(tasks).values(task);
      console.log(`Created task: ${task.title}`);
    }
    
    console.log(`Successfully seeded ${defaultTasks.length} default tasks for user ${userId}`);
  } catch (error) {
    console.error("Error seeding default tasks:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // This would be used for manual seeding
  console.log("Default task seeding function ready");
}