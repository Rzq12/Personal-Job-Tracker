// Demo data for local development without database

export interface DemoJob {
  id: number;
  position: string;
  company: string;
  location: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  status: string;
  dateSaved: string;
  deadline: string | null;
  dateApplied: string | null;
  followUp: string | null;
  excitement: number;
  jobDescription: string | null;
  keywords: string[];
  link: string | null;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

const demoJobs: DemoJob[] = [
  {
    id: 1,
    position: 'Product Designer',
    company: 'Acme Corp',
    location: 'Anywhere, USA',
    minSalary: null,
    maxSalary: 0,
    status: 'Applied',
    dateSaved: '2025-12-05T00:00:00.000Z',
    deadline: '2025-12-04T00:00:00.000Z',
    dateApplied: '2025-12-05T00:00:00.000Z',
    followUp: '2025-12-08T00:00:00.000Z',
    excitement: 2,
    jobDescription: 'We are searching for a passionate product designer to join our team.',
    keywords: ['Computer-Aided Design', 'Prototyping', '3D Modeling'],
    link: 'https://example.com/job/1',
    notes: null,
    archived: false,
    createdAt: '2025-12-05T00:00:00.000Z',
    updatedAt: '2025-12-05T00:00:00.000Z',
  },
  {
    id: 2,
    position: 'Marketing Manager',
    company: 'Acme Corp',
    location: 'Anywhere, USA',
    minSalary: null,
    maxSalary: 0,
    status: 'Bookmarked',
    dateSaved: '2025-12-05T00:00:00.000Z',
    deadline: null,
    dateApplied: '2025-12-05T00:00:00.000Z',
    followUp: '2025-12-08T00:00:00.000Z',
    excitement: 2,
    jobDescription: null,
    keywords: [],
    link: 'https://example.com/job/2',
    notes: null,
    archived: false,
    createdAt: '2025-12-05T00:00:00.000Z',
    updatedAt: '2025-12-05T00:00:00.000Z',
  },
  {
    id: 3,
    position: 'Operations Manager',
    company: 'Acme Corp',
    location: 'remote',
    minSalary: null,
    maxSalary: 0,
    status: 'Bookmarked',
    dateSaved: '2025-12-05T00:00:00.000Z',
    deadline: null,
    dateApplied: '2025-12-05T00:00:00.000Z',
    followUp: '2025-12-08T00:00:00.000Z',
    excitement: 2,
    jobDescription: null,
    keywords: [],
    link: 'https://example.com/job/3',
    notes: null,
    archived: false,
    createdAt: '2025-12-05T00:00:00.000Z',
    updatedAt: '2025-12-05T00:00:00.000Z',
  },
  {
    id: 4,
    position: 'Software Engineer',
    company: 'Tech Startup',
    location: 'Jakarta, Indonesia',
    minSalary: 15000000,
    maxSalary: 25000000,
    status: 'Interviewing',
    dateSaved: '2025-11-20T00:00:00.000Z',
    deadline: '2025-12-15T00:00:00.000Z',
    dateApplied: '2025-11-25T00:00:00.000Z',
    followUp: '2025-12-10T00:00:00.000Z',
    excitement: 4,
    jobDescription: 'Looking for a full-stack developer with React and Node.js experience.',
    keywords: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    link: 'https://example.com/job/4',
    notes: 'Had first interview, waiting for technical round',
    archived: false,
    createdAt: '2025-11-20T00:00:00.000Z',
    updatedAt: '2025-12-01T00:00:00.000Z',
  },
  {
    id: 5,
    position: 'Frontend Developer',
    company: 'Digital Agency',
    location: 'Remote',
    minSalary: 10000000,
    maxSalary: 18000000,
    status: 'Applying',
    dateSaved: '2025-12-01T00:00:00.000Z',
    deadline: '2025-12-20T00:00:00.000Z',
    dateApplied: null,
    followUp: null,
    excitement: 3,
    jobDescription: 'Join our creative team to build amazing web experiences.',
    keywords: ['Vue.js', 'Tailwind CSS', 'Figma'],
    link: 'https://example.com/job/5',
    notes: 'Preparing portfolio for application',
    archived: false,
    createdAt: '2025-12-01T00:00:00.000Z',
    updatedAt: '2025-12-01T00:00:00.000Z',
  },
];

// In-memory storage
let jobs = [...demoJobs];
let nextId = jobs.length + 1;

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export function getDemoJobs(): DemoJob[] {
  return jobs.filter((j) => !j.archived);
}

export function getAllDemoJobs(): DemoJob[] {
  return jobs;
}

export function getDemoJob(id: number): DemoJob | undefined {
  return jobs.find((j) => j.id === id);
}

export function createDemoJob(data: Partial<DemoJob>): DemoJob {
  const now = new Date().toISOString();
  const newJob: DemoJob = {
    id: nextId++,
    position: data.position || '',
    company: data.company || '',
    location: data.location || null,
    minSalary: data.minSalary || null,
    maxSalary: data.maxSalary || null,
    status: data.status || 'Bookmarked',
    dateSaved: data.dateSaved || now,
    deadline: data.deadline || null,
    dateApplied: data.dateApplied || null,
    followUp: data.followUp || null,
    excitement: data.excitement || 3,
    jobDescription: data.jobDescription || null,
    keywords: data.keywords || [],
    link: data.link || null,
    notes: data.notes || null,
    archived: data.archived || false,
    createdAt: now,
    updatedAt: now,
  };
  jobs.unshift(newJob);
  return newJob;
}

export function updateDemoJob(id: number, data: Partial<DemoJob>): DemoJob | null {
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) return null;

  jobs[index] = {
    ...jobs[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return jobs[index];
}

export function deleteDemoJob(id: number): boolean {
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) return false;
  jobs.splice(index, 1);
  return true;
}

export function getDemoStats() {
  const allJobs = jobs.filter((j) => !j.archived);
  const byStatus: Record<string, number> = {};

  allJobs.forEach((job) => {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1;
  });

  // Monthly counts
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
  monthNames.forEach((m) => (monthCounts[m] = 0));

  allJobs.forEach((job) => {
    const month = new Date(job.dateSaved).getMonth();
    monthCounts[monthNames[month]]++;
  });

  return {
    total: allJobs.length,
    byStatus,
    byMonth: monthNames.map((month) => ({ month, count: monthCounts[month] })),
  };
}
