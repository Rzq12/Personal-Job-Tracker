import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDemoMode, getDemoJobs, getAllDemoJobs, createDemoJob } from '../lib/demo-data';

const getPrisma = async () => {
  if (isDemoMode()) return null;
  const { default: prisma } = await import('../lib/prisma');
  return prisma;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await getJobs(req, res);
    } else if (req.method === 'POST') {
      return await createJob(req, res);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function getJobs(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    size = '20',
    search,
    status,
    archived,
    sort = '-dateSaved',
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10);
  const sizeNum = parseInt(size, 10);
  const showArchived = archived === 'true';

  // Demo mode
  if (isDemoMode()) {
    let jobs = showArchived ? getAllDemoJobs() : getDemoJobs();

    // Filter
    if (search) {
      const s = search.toLowerCase();
      jobs = jobs.filter(
        (j) => j.company.toLowerCase().includes(s) || j.position.toLowerCase().includes(s)
      );
    }
    if (status) {
      jobs = jobs.filter((j) => j.status === status);
    }

    // Sort
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    jobs.sort((a, b) => {
      const aVal = (a as any)[sortField] || '';
      const bVal = (b as any)[sortField] || '';
      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Paginate
    const total = jobs.length;
    const start = (pageNum - 1) * sizeNum;
    const paginatedJobs = jobs.slice(start, start + sizeNum);

    return res.status(200).json({
      data: paginatedJobs,
      meta: {
        page: pageNum,
        size: sizeNum,
        total,
        totalPages: Math.ceil(total / sizeNum),
      },
    });
  }

  // Database mode
  const prisma = await getPrisma();
  if (!prisma) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { company: { contains: search, mode: 'insensitive' } },
      { position: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (!showArchived) {
    where.archived = false;
  }

  // Sort
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
  const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: (pageNum - 1) * sizeNum,
      take: sizeNum,
    }),
    prisma.job.count({ where }),
  ]);

  return res.status(200).json({
    data: jobs,
    meta: {
      page: pageNum,
      size: sizeNum,
      total,
      totalPages: Math.ceil(total / sizeNum),
    },
  });
}

async function createJob(req: VercelRequest, res: VercelResponse) {
  const {
    position,
    company,
    location,
    minSalary,
    maxSalary,
    status,
    dateSaved,
    deadline,
    dateApplied,
    followUp,
    excitement,
    jobDescription,
    keywords,
    link,
    notes,
  } = req.body;

  if (!position || !company) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Position and company are required',
    });
  }

  // Demo mode
  if (isDemoMode()) {
    const job = createDemoJob({
      position,
      company,
      location,
      minSalary,
      maxSalary,
      status: status || 'Bookmarked',
      dateSaved: dateSaved || new Date().toISOString(),
      deadline,
      dateApplied,
      followUp,
      excitement: excitement || 3,
      jobDescription,
      keywords: keywords || [],
      link,
      notes,
    });
    return res.status(201).json({ data: job });
  }

  const prisma = await getPrisma();
  if (!prisma) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const job = await prisma.job.create({
    data: {
      position,
      company,
      location: location || null,
      minSalary: minSalary || null,
      maxSalary: maxSalary || null,
      status: status || 'Bookmarked',
      dateSaved: dateSaved ? new Date(dateSaved) : new Date(),
      deadline: deadline ? new Date(deadline) : null,
      dateApplied: dateApplied ? new Date(dateApplied) : null,
      followUp: followUp ? new Date(followUp) : null,
      excitement: excitement || 3,
      jobDescription: jobDescription || null,
      keywords: keywords || [],
      link: link || null,
      notes: notes || null,
    },
  });

  return res.status(201).json({ data: job });
}
