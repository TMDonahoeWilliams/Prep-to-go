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

    // Demo task stats - in production, this would be calculated from the database
    const stats = {
      totalTasks: 5,
      completedTasks: 0,
      overdueTasks: 1, // FAFSA is overdue as of March 2025
      upcomingTasks: 4, // Tasks due in the future
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Task stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}