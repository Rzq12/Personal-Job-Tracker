import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDemoMode, getDemoStats } from './lib/demo-data';

const getPrisma = async () => {
  if (isDemoMode()) return null;
  const { default: prisma } = await import('./lib/prisma');
  return prisma;
};

const PIPELINE_STATUSES = [
  'Bookmarked',
  'Applying',
  'Applied',
  'Interviewing',
  'Negotiating',
  'Accepted',
];
const ALL_STATUSES = [
  ...PIPELINE_STATUSES,
  'I Withdrew',
  'Not Selected',
  'No Response',
  'Archived',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Demo mode
    if (isDemoMode()) {
      const stats = getDemoStats();
      return res.status(200).json({ data: stats });
    }

    const prisma = await getPrisma();
    if (!prisma) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Get total counts by status
    const statusCounts = await Promise.all(
      ALL_STATUSES.map(async (status) => ({
        status,
        count: await prisma.job.count({ where: { status, archived: false } }),
      }))
    );

    // Build byStatus object
    const byStatus: Record<string, number> = {};
    statusCounts.forEach(({ status, count }) => {
      byStatus[status] = count;
    });

    // Get pipeline counts (for the pipeline bar)
    const pipelineCounts: Record<string, number> = {};
    PIPELINE_STATUSES.forEach((status) => {
      pipelineCounts[status] = byStatus[status] || 0;
    });

    // Get total active (non-archived) jobs
    const totalActive = await prisma.job.count({ where: { archived: false } });

    // Get archived count
    const totalArchived = await prisma.job.count({ where: { archived: true } });

    // Get monthly application counts for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const monthlyData = await prisma.job.groupBy({
      by: ['dateSaved'],
      where: {
        dateSaved: {
          gte: startOfYear,
          lte: endOfYear,
        },
        archived: false,
      },
      _count: true,
    });

    // Aggregate by month
    const monthCounts: Record<string, number> = {};
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Initialize all months with 0
    monthNames.forEach((month) => {
      monthCounts[month] = 0;
    });

    // Count applications per month
    monthlyData.forEach((item) => {
      const month = new Date(item.dateSaved).getMonth();
      const monthName = monthNames[month];
      monthCounts[monthName] += item._count;
    });

    // Convert to array format
    const byMonth = monthNames.map((month) => ({
      month,
      count: monthCounts[month],
    }));

    const stats = {
      totalActive,
      totalArchived,
      pipeline: pipelineCounts,
      byStatus,
      byMonth,
    };

    return res.status(200).json({ data: stats });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
