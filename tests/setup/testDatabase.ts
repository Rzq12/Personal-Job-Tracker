interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
  refreshToken: string | null;
  createdAt: Date;
}

interface TestJob {
  id: number;
  userId: number;
  position: string;
  company: string;
  location: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  status: string;
  dateSaved: Date;
  deadline: Date | null;
  dateApplied: Date | null;
  followUp: Date | null;
  excitement: number;
  jobDescription: string | null;
  keywords: string[];
  link: string | null;
  notes: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const state = {
  users: [] as TestUser[],
  jobs: [] as TestJob[],
  nextUserId: 1,
  nextJobId: 1,
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const applyJobFilter = (jobs: TestJob[], where?: any): TestJob[] => {
  if (!where) return jobs;

  return jobs.filter((job) => {
    if (where.id !== undefined && job.id !== where.id) return false;
    if (where.userId !== undefined && job.userId !== where.userId) return false;
    if (where.status !== undefined && job.status !== where.status) return false;
    if (where.archived !== undefined && job.archived !== where.archived) return false;

    if (where.dateSaved?.gte && job.dateSaved < where.dateSaved.gte) return false;
    if (where.dateSaved?.lte && job.dateSaved > where.dateSaved.lte) return false;

    if (Array.isArray(where.OR) && where.OR.length > 0) {
      const matchesOr = where.OR.some((clause: any) => {
        if (clause.company?.contains) {
          return job.company.toLowerCase().includes(String(clause.company.contains).toLowerCase());
        }
        if (clause.position?.contains) {
          return job.position.toLowerCase().includes(String(clause.position.contains).toLowerCase());
        }
        return false;
      });
      if (!matchesOr) return false;
    }

    return true;
  });
};

export function resetTestDatabase() {
  state.users = [];
  state.jobs = [];
  state.nextUserId = 1;
  state.nextJobId = 1;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const user: TestUser = {
    id: overrides.id ?? state.nextUserId++,
    email: overrides.email ?? `user${state.nextUserId}@example.com`,
    password: overrides.password ?? '$2a$10$abcdefghijklmnopqrstuv',
    name: overrides.name ?? 'Test User',
    refreshToken: overrides.refreshToken ?? null,
    createdAt: overrides.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
  };

  state.users.push(user);
  return clone(user);
}

export function createTestJob(overrides: Partial<TestJob> = {}): TestJob {
  const job: TestJob = {
    id: overrides.id ?? state.nextJobId++,
    userId: overrides.userId ?? 1,
    position: overrides.position ?? 'Backend Engineer',
    company: overrides.company ?? 'Acme Inc',
    location: overrides.location ?? 'Remote',
    minSalary: overrides.minSalary ?? null,
    maxSalary: overrides.maxSalary ?? null,
    status: overrides.status ?? 'Applied',
    dateSaved: overrides.dateSaved ?? new Date('2026-01-10T00:00:00.000Z'),
    deadline: overrides.deadline ?? null,
    dateApplied: overrides.dateApplied ?? null,
    followUp: overrides.followUp ?? null,
    excitement: overrides.excitement ?? 3,
    jobDescription: overrides.jobDescription ?? null,
    keywords: overrides.keywords ?? [],
    link: overrides.link ?? null,
    notes: overrides.notes ?? null,
    archived: overrides.archived ?? false,
    createdAt: overrides.createdAt ?? new Date('2026-01-10T00:00:00.000Z'),
    updatedAt: overrides.updatedAt ?? new Date('2026-01-10T00:00:00.000Z'),
  };

  state.jobs.push(job);
  return clone(job);
}

export function getStateSnapshot() {
  return clone(state);
}

export const prismaMock = {
  user: {
    async findUnique(args: any) {
      const where = args?.where || {};
      const select = args?.select;

      const user = state.users.find((u) => {
        if (where.id !== undefined) return u.id === where.id;
        if (where.email !== undefined) return u.email === where.email;
        return false;
      });

      if (!user) return null;
      if (!select) return clone(user);

      const selected: Record<string, unknown> = {};
      Object.keys(select).forEach((key) => {
        if (select[key]) {
          selected[key] = (user as any)[key];
        }
      });
      return clone(selected);
    },
    async create(args: any) {
      const data = args.data;
      const user: TestUser = {
        id: state.nextUserId++,
        email: data.email,
        password: data.password,
        name: data.name ?? null,
        refreshToken: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      };
      state.users.push(user);
      return clone(user);
    },
    async update(args: any) {
      const where = args.where;
      const data = args.data;
      const select = args.select;

      const user = state.users.find((u) => u.id === where.id);
      if (!user) {
        throw new Error('User not found');
      }

      Object.assign(user, data);

      if (!select) return clone(user);
      const selected: Record<string, unknown> = {};
      Object.keys(select).forEach((key) => {
        if (select[key]) {
          selected[key] = (user as any)[key];
        }
      });
      return clone(selected);
    },
  },
  job: {
    async findMany(args: any) {
      const where = args?.where;
      const orderBy = args?.orderBy;
      const skip = args?.skip ?? 0;
      const take = args?.take ?? Number.MAX_SAFE_INTEGER;

      let rows = applyJobFilter(state.jobs, where);

      if (orderBy) {
        const [field, direction] = Object.entries(orderBy)[0] as [keyof TestJob, 'asc' | 'desc'];
        rows = rows.sort((a, b) => {
          const av = a[field] as any;
          const bv = b[field] as any;
          if (av < bv) return direction === 'asc' ? -1 : 1;
          if (av > bv) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return clone(rows.slice(skip, skip + take));
    },
    async count(args: any) {
      return applyJobFilter(state.jobs, args?.where).length;
    },
    async findFirst(args: any) {
      const rows = applyJobFilter(state.jobs, args?.where);
      return rows.length > 0 ? clone(rows[0]) : null;
    },
    async create(args: any) {
      const data = args.data;
      const now = new Date('2026-01-10T00:00:00.000Z');

      const job: TestJob = {
        id: state.nextJobId++,
        userId: data.userId,
        position: data.position,
        company: data.company,
        location: data.location ?? null,
        minSalary: data.minSalary ?? null,
        maxSalary: data.maxSalary ?? null,
        status: data.status ?? 'Bookmarked',
        dateSaved: data.dateSaved ?? now,
        deadline: data.deadline ?? null,
        dateApplied: data.dateApplied ?? null,
        followUp: data.followUp ?? null,
        excitement: data.excitement ?? 3,
        jobDescription: data.jobDescription ?? null,
        keywords: data.keywords ?? [],
        link: data.link ?? null,
        notes: data.notes ?? null,
        archived: data.archived ?? false,
        createdAt: now,
        updatedAt: now,
      };

      state.jobs.push(job);
      return clone(job);
    },
    async update(args: any) {
      const where = args.where;
      const data = args.data;

      const job = state.jobs.find((j) => j.id === where.id);
      if (!job) {
        throw new Error('Job not found');
      }

      Object.assign(job, data, { updatedAt: new Date('2026-01-11T00:00:00.000Z') });
      return clone(job);
    },
    async delete(args: any) {
      const where = args.where;
      const idx = state.jobs.findIndex((j) => j.id === where.id);
      if (idx === -1) {
        throw new Error('Job not found');
      }
      const [deleted] = state.jobs.splice(idx, 1);
      return clone(deleted);
    },
    async groupBy(args: any) {
      const rows = applyJobFilter(state.jobs, args?.where);
      const grouped = new Map<string, { dateSaved: Date; _count: number }>();

      rows.forEach((job) => {
        const key = job.dateSaved.toISOString();
        const current = grouped.get(key);
        if (!current) {
          grouped.set(key, { dateSaved: new Date(job.dateSaved), _count: 1 });
          return;
        }
        current._count += 1;
      });

      return Array.from(grouped.values());
    },
  },
};
