import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    // Demo task stats - calculated from comprehensive default tasks with major scholarships
    const today = new Date();
    const stats = {
      totalTasks: 28, // Total comprehensive default tasks including major national scholarships
      completedTasks: 0,
      overdueTasks: 8, // QuestBridge, Horatio Alger, Coca-Cola, National Merit, Early Decision, etc.
      upcomingTasks: 20, // Tasks due in the future including all FAFSA and scholarship deadlines
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Task stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}