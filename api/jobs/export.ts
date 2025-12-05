import type { VercelRequest, VercelResponse } from '@vercel/node';
import ExcelJS from 'exceljs';
import { isDemoMode, getDemoJobs, getAllDemoJobs } from '../lib/demo-data';

interface JobData {
  id: number;
  position: string;
  company: string;
  location: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  status: string;
  dateSaved: string | Date;
  deadline: string | Date | null;
  dateApplied: string | Date | null;
  followUp: string | Date | null;
  excitement: number;
  jobDescription: string | null;
  keywords: string[];
  link: string | null;
  notes: string | null;
  archived: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const getPrisma = async () => {
  if (isDemoMode()) return null;
  const { default: prisma } = await import('../lib/prisma');
  return prisma;
};

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
    const { status, archived, fromDate, toDate, search } = req.query as Record<string, string>;
    const showArchived = archived === 'true';

    let jobs: JobData[];

    // Demo mode
    if (isDemoMode()) {
      let demoJobs = showArchived ? getAllDemoJobs() : getDemoJobs();

      // Apply filters manually for demo mode
      if (search) {
        const searchLower = search.toLowerCase();
        demoJobs = demoJobs.filter(
          (j) =>
            j.company.toLowerCase().includes(searchLower) ||
            j.position.toLowerCase().includes(searchLower)
        );
      }
      if (status) {
        demoJobs = demoJobs.filter((j) => j.status === status);
      }
      if (fromDate) {
        demoJobs = demoJobs.filter((j) => new Date(j.dateSaved) >= new Date(fromDate));
      }
      if (toDate) {
        demoJobs = demoJobs.filter((j) => new Date(j.dateSaved) <= new Date(toDate));
      }

      jobs = demoJobs as JobData[];
    } else {
      const prisma = await getPrisma();
      if (!prisma) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      // Build where clause
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

      if (fromDate) {
        where.dateSaved = {
          ...where.dateSaved,
          gte: new Date(fromDate),
        };
      }

      if (toDate) {
        where.dateSaved = {
          ...where.dateSaved,
          lte: new Date(toDate),
        };
      }

      // Fetch all matching jobs
      jobs = await prisma.job.findMany({
        where,
        orderBy: { dateSaved: 'desc' },
      });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Job Tracker';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Job Applications', {
      headerFooter: {
        firstHeader: 'Job Applications Export',
      },
    });

    // Define columns
    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Position', key: 'position', width: 25 },
      { header: 'Company', key: 'company', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Salary Range', key: 'salary', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date Saved', key: 'dateSaved', width: 15 },
      { header: 'Date Applied', key: 'dateApplied', width: 15 },
      { header: 'Deadline', key: 'deadline', width: 15 },
      { header: 'Follow Up', key: 'followUp', width: 15 },
      { header: 'Excitement', key: 'excitement', width: 12 },
      { header: 'Keywords', key: 'keywords', width: 25 },
      { header: 'Link', key: 'link', width: 40 },
      { header: 'Notes', key: 'notes', width: 35 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }, // Indigo color
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    jobs.forEach((job, index) => {
      const salaryRange =
        job.minSalary || job.maxSalary
          ? `${job.minSalary ? formatCurrency(job.minSalary) : '?'} - ${job.maxSalary ? formatCurrency(job.maxSalary) : '?'}`
          : '-';

      const row = worksheet.addRow({
        no: index + 1,
        position: job.position,
        company: job.company,
        location: job.location || '-',
        salary: salaryRange,
        status: job.status,
        dateSaved: formatDate(new Date(job.dateSaved)),
        dateApplied: job.dateApplied ? formatDate(new Date(job.dateApplied)) : '-',
        deadline: job.deadline ? formatDate(new Date(job.deadline)) : '-',
        followUp: job.followUp ? formatDate(new Date(job.followUp)) : '-',
        excitement: '★'.repeat(job.excitement) + '☆'.repeat(5 - job.excitement),
        keywords: job.keywords?.join(', ') || '-',
        link: job.link || '-',
        notes: job.notes || '-',
      });

      // Apply status color
      const statusCell = row.getCell('status');
      const statusColors: Record<string, { bg: string; fg: string }> = {
        Bookmarked: { bg: 'FF6B7280', fg: 'FFFFFFFF' },
        Applying: { bg: 'FFF59E0B', fg: 'FF000000' },
        Applied: { bg: 'FF3B82F6', fg: 'FFFFFFFF' },
        Interviewing: { bg: 'FF8B5CF6', fg: 'FFFFFFFF' },
        Negotiating: { bg: 'FF06B6D4', fg: 'FFFFFFFF' },
        Accepted: { bg: 'FF10B981', fg: 'FFFFFFFF' },
        'I Withdrew': { bg: 'FFF97316', fg: 'FFFFFFFF' },
        'Not Selected': { bg: 'FFEF4444', fg: 'FFFFFFFF' },
        'No Response': { bg: 'FF9CA3AF', fg: 'FF000000' },
        Archived: { bg: 'FF374151', fg: 'FFFFFFFF' },
      };

      const statusColor = statusColors[job.status];
      if (statusColor) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor.bg },
        };
        statusCell.font = { color: { argb: statusColor.fg } };
      }

      // Alternate row colors
      if (index % 2 === 0) {
        row.eachCell((cell, colNumber) => {
          if (colNumber !== 6) {
            // Skip status cell
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF3F4F6' },
            };
          }
        });
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers for file download
    const filename = `job-applications-${formatDateForFilename(new Date())}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', (buffer as ArrayBuffer).byteLength.toString());

    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Export Error:', error);
    return res.status(500).json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
