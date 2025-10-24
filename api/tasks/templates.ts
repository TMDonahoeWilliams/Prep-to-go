import type { VercelRequest, VercelResponse } from '@vercel/node';

// State-specific college application deadlines and requirements
const stateSpecificTasks = {
  // California
  'CA': [
    {
      title: 'UC System Application',
      description: 'Submit University of California application (all 9 UC campuses use same app)',
      dueDate: '2024-11-30T23:59:00Z',
      priority: 'urgent',
      categoryId: 'cat-1',
      notes: 'No letters of recommendation required. Personal insight questions instead of essays.'
    },
    {
      title: 'Cal Grant Application',
      description: 'Submit California Aid Commission Cal Grant application',
      dueDate: '2025-03-02T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Must submit FAFSA and GPA verification form by March 2nd.'
    }
  ],
  
  // Texas
  'TX': [
    {
      title: 'ApplyTexas Application',
      description: 'Submit ApplyTexas application for UT system and other Texas public universities',
      dueDate: '2024-12-01T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-1',
      notes: 'Separate application system from Common App for most Texas public schools.'
    },
    {
      title: 'TASFA Application',
      description: 'Submit Texas Application for State Financial Aid (for non-citizens)',
      dueDate: '2025-01-15T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Alternative to FAFSA for students who cannot complete federal aid forms.'
    }
  ],

  // New York
  'NY': [
    {
      title: 'SUNY Application',
      description: 'Submit State University of New York application',
      dueDate: '2025-01-15T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-1',
      notes: 'Single application for all SUNY schools. Very affordable tuition for NY residents.'
    },
    {
      title: 'TAP Application',
      description: 'Apply for New York State Tuition Assistance Program',
      dueDate: '2025-05-01T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'NY state grant program. Must complete FAFSA first.'
    }
  ],

  // Florida
  'FL': [
    {
      title: 'Florida Academic Scholars Program',
      description: 'Apply for Bright Futures Scholarship Program',
      dueDate: '2025-05-15T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Florida residents with strong academic records. Covers significant tuition costs.'
    }
  ],

  // Georgia
  'GA': [
    {
      title: 'HOPE Scholarship Application',
      description: 'Apply for Georgia HOPE Scholarship through GSFC',
      dueDate: '2025-04-01T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Georgia residents with 3.0+ GPA. Covers most tuition at Georgia public colleges.'
    }
  ],

  // Illinois
  'IL': [
    {
      title: 'MAP Grant Application',
      description: 'Apply for Illinois Monetary Award Program grant',
      dueDate: '2025-03-01T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Need-based grant for Illinois residents. Funds limited - apply early.'
    }
  ],

  // Virginia
  'VA': [
    {
      title: 'Virginia Commonwealth Award',
      description: 'Apply for Virginia Commonwealth Award grant program',
      dueDate: '2025-03-01T23:59:00Z',
      priority: 'high',
      categoryId: 'cat-2',
      notes: 'Need-based grant for Virginia residents attending in-state schools.'
    }
  ]
};

// Common scholarship deadlines that apply to all states
const nationalScholarships = [
  {
    title: 'Coca-Cola Scholars Program',
    description: 'Apply for $20,000 Coca-Cola Scholars Program scholarship',
    dueDate: '2024-10-31T23:59:00Z',
    priority: 'high',
    categoryId: 'cat-2',
    notes: 'Leadership and academic excellence. 150 winners annually.'
  },
  {
    title: 'Gates Millennium Scholars',
    description: 'Apply for Gates Millennium Scholars Program (minority students)',
    dueDate: '2025-01-15T23:59:00Z',
    priority: 'high',
    categoryId: 'cat-2',
    notes: 'Full college funding for outstanding minority students with financial need.'
  },
  {
    title: 'Jack Kent Cooke Foundation',
    description: 'Apply for Jack Kent Cooke Foundation College Scholarship',
    dueDate: '2024-11-15T23:59:00Z',
    priority: 'high',
    categoryId: 'cat-2',
    notes: 'Up to $55,000/year for high-achieving students with financial need.'
  }
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

    const { state } = req.query;

    if (state && typeof state === 'string' && stateSpecificTasks[state.toUpperCase() as keyof typeof stateSpecificTasks]) {
      // Return state-specific tasks plus national scholarships
      const stateTasks = stateSpecificTasks[state.toUpperCase() as keyof typeof stateSpecificTasks];
      return res.status(200).json({
        stateTasks,
        nationalScholarships,
        state: state.toUpperCase()
      });
    }

    // Return all available states and national scholarships
    return res.status(200).json({
      availableStates: Object.keys(stateSpecificTasks),
      nationalScholarships,
      message: 'Provide ?state=XX parameter to get state-specific tasks'
    });

  } catch (error) {
    console.error('Task templates API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}