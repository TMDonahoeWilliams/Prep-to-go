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

// Sample categories data for demo (now using actual Supabase UUIDs)
const sampleCategories = [
  {
    id: SUPABASE_CATEGORY_IDS['College Applications'],
    name: 'College Applications',
    description: 'Application submissions, essays, and deadlines',
    color: 'chart-1',
    icon: 'FileText',
    sortOrder: 1,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: SUPABASE_CATEGORY_IDS['Financial Aid & FAFSA'],
    name: 'Financial Aid & FAFSA',
    description: 'Financial aid forms, scholarships, and FAFSA submission',
    color: 'chart-2',
    icon: 'DollarSign',
    sortOrder: 2,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: SUPABASE_CATEGORY_IDS['Housing & Registration'],
    name: 'Housing & Registration',
    description: 'Dorm selection, course registration, and orientation',
    color: 'chart-3',
    icon: 'Home',
    sortOrder: 3,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: SUPABASE_CATEGORY_IDS['Testing & Transcripts'],
    name: 'Testing & Transcripts',
    description: 'SAT/ACT scores, transcripts, and test prep',
    color: 'chart-4',
    icon: 'GraduationCap',
    sortOrder: 4,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: SUPABASE_CATEGORY_IDS['Health & Documentation'],
    name: 'Health & Documentation',
    description: 'Immunizations, insurance, and medical records',
    color: 'chart-5',
    icon: 'Heart',
    sortOrder: 5,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: SUPABASE_CATEGORY_IDS['Move-In Preparation'],
    name: 'Move-In Preparation',
    description: 'Packing, shopping, and logistics for move-in',
    color: 'primary',
    icon: 'Package',
    sortOrder: 6,
    createdAt: '2024-10-20T00:00:00Z',
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).json({ message: 'OK' });
    }

    // Only handle GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return sample categories
    return res.status(200).json(sampleCategories);

  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}