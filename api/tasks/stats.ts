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

    // Demo task stats - calculated from comprehensive default tasks
    const today = new Date();
    const stats = {
      totalTasks: 16, // Total comprehensive default tasks
      completedTasks: 0,
      overdueTasks: 3, // National Merit, Early Decision, UC System deadlines have passed
      upcomingTasks: 13, // Tasks due in the future
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Task stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}