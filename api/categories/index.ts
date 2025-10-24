import type { VercelRequest, VercelResponse } from '@vercel/node';

// Sample categories data for demo
const sampleCategories = [
  {
    id: 'cat-1',
    name: 'College Applications',
    description: 'Application submissions, essays, and deadlines',
    color: 'chart-1',
    icon: 'FileText',
    sortOrder: 1,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Financial Aid & FAFSA',
    description: 'Financial aid forms, scholarships, and FAFSA submission',
    color: 'chart-2',
    icon: 'DollarSign',
    sortOrder: 2,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Housing & Registration',
    description: 'Dorm selection, course registration, and orientation',
    color: 'chart-3',
    icon: 'Home',
    sortOrder: 3,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Testing & Transcripts',
    description: 'SAT/ACT scores, transcripts, and test prep',
    color: 'chart-4',
    icon: 'GraduationCap',
    sortOrder: 4,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cat-5',
    name: 'Health & Documentation',
    description: 'Immunizations, insurance, and medical records',
    color: 'chart-5',
    icon: 'Heart',
    sortOrder: 5,
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: 'cat-6',
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