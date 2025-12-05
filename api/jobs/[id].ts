import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isDemoMode, getDemoJob, updateDemoJob, deleteDemoJob } from '../lib/demo-data';

const getPrisma = async () => {
  if (isDemoMode()) return null;
  const { default: prisma } = await import('../lib/prisma');
  return prisma;
};

const VALID_STATUSES = [
  'Bookmarked',
  'Applying',
  'Applied',
  'Interviewing',
  'Negotiating',
  'Accepted',
  'I Withdrew',
  'Not Selected',
  'No Response',
  'Archived',
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const jobId = parseInt(id as string, 10);

  if (isNaN(jobId)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid job ID',
    });
  }

  try {
    if (req.method === 'GET') {
      return await getJob(jobId, res);
    } else if (req.method === 'PUT') {
      return await updateJob(jobId, req, res);
    } else if (req.method === 'DELETE') {
      return await deleteJob(jobId, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function getJob(id: number, res: VercelResponse) {
  // Demo mode
  if (isDemoMode()) {
    const job = getDemoJob(id);
    if (!job) {
      return res.status(404).json({ error: 'Not found', message: `Job with ID ${id} not found` });
    }
    return res.status(200).json({ data: job });
  }

  const prisma = await getPrisma();
  if (!prisma) return res.status(500).json({ error: 'Database not configured' });

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    return res.status(404).json({
      error: 'Not found',
      message: `Job with ID ${id} not found`,
    });
  }

  return res.status(200).json({ data: job });
}

async function updateJob(id: number, req: VercelRequest, res: VercelResponse) {
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
    archived,
  } = req.body;

  // Validation
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: 'Validation error',
      message: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  if (excitement !== undefined && (excitement < 1 || excitement > 5)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'excitement must be between 1 and 5',
    });
  }

  if (link && !isValidUrl(link)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid URL format for link',
    });
  }

  // Demo mode
  if (isDemoMode()) {
    const job = updateDemoJob(id, {
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
      archived,
    });
    if (!job) {
      return res.status(404).json({ error: 'Not found', message: `Job with ID ${id} not found` });
    }
    return res.status(200).json({ data: job });
  }

  const prisma = await getPrisma();
  if (!prisma) return res.status(500).json({ error: 'Database not configured' });

  // Check if job exists
  const existingJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!existingJob) {
    return res.status(404).json({
      error: 'Not found',
      message: `Job with ID ${id} not found`,
    });
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...(position && { position }),
      ...(company && { company }),
      ...(location !== undefined && { location: location || null }),
      ...(minSalary !== undefined && { minSalary: minSalary || null }),
      ...(maxSalary !== undefined && { maxSalary: maxSalary || null }),
      ...(status && { status }),
      ...(dateSaved && { dateSaved: new Date(dateSaved) }),
      ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      ...(dateApplied !== undefined && { dateApplied: dateApplied ? new Date(dateApplied) : null }),
      ...(followUp !== undefined && { followUp: followUp ? new Date(followUp) : null }),
      ...(excitement !== undefined && { excitement }),
      ...(jobDescription !== undefined && { jobDescription: jobDescription || null }),
      ...(keywords !== undefined && { keywords: keywords || [] }),
      ...(link !== undefined && { link: link || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(archived !== undefined && { archived }),
    },
  });

  return res.status(200).json({ data: job });
}

async function deleteJob(id: number, res: VercelResponse) {
  // Demo mode
  if (isDemoMode()) {
    const success = deleteDemoJob(id);
    if (!success) {
      return res.status(404).json({ error: 'Not found', message: `Job with ID ${id} not found` });
    }
    return res.status(200).json({ data: { message: `Job with ID ${id} deleted successfully` } });
  }

  const prisma = await getPrisma();
  if (!prisma) return res.status(500).json({ error: 'Database not configured' });

  // Check if job exists
  const existingJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!existingJob) {
    return res.status(404).json({
      error: 'Not found',
      message: `Job with ID ${id} not found`,
    });
  }

  await prisma.job.delete({
    where: { id },
  });

  return res.status(200).json({
    data: { message: `Job with ID ${id} deleted successfully` },
  });
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}
