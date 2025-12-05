import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleJobs = [
  {
    position: 'Senior Frontend Developer',
    company: 'Google',
    location: 'Mountain View, CA',
    minSalary: 150000,
    maxSalary: 200000,
    status: 'Applied',
    dateSaved: new Date('2025-01-15'),
    dateApplied: new Date('2025-01-18'),
    deadline: new Date('2025-02-15'),
    excitement: 5,
    jobDescription: 'Build next-generation web applications using React and TypeScript.',
    keywords: ['React', 'TypeScript', 'GraphQL'],
    link: 'https://careers.google.com',
    notes: 'Referral from John, submitted resume and portfolio.',
  },
  {
    position: 'Full Stack Engineer',
    company: 'Meta',
    location: 'Menlo Park, CA',
    minSalary: 140000,
    maxSalary: 190000,
    status: 'Interviewing',
    dateSaved: new Date('2025-01-20'),
    dateApplied: new Date('2025-01-22'),
    followUp: new Date('2025-02-05'),
    excitement: 4,
    jobDescription: 'Work on Instagram web platform.',
    keywords: ['React', 'Node.js', 'PostgreSQL'],
    link: 'https://www.metacareers.com',
    notes: 'Phone screen completed, technical interview scheduled.',
  },
  {
    position: 'Software Engineer',
    company: 'Microsoft',
    location: 'Seattle, WA',
    minSalary: 130000,
    maxSalary: 180000,
    status: 'Bookmarked',
    dateSaved: new Date('2025-02-01'),
    excitement: 4,
    jobDescription: 'Azure cloud services development.',
    keywords: ['C#', 'Azure', 'Microservices'],
    link: 'https://careers.microsoft.com',
    notes: 'Interesting team working on AI integration.',
  },
  {
    position: 'Backend Developer',
    company: 'Amazon',
    location: 'Remote',
    minSalary: 145000,
    maxSalary: 185000,
    status: 'Applied',
    dateSaved: new Date('2025-02-05'),
    dateApplied: new Date('2025-02-08'),
    deadline: new Date('2025-03-01'),
    excitement: 3,
    keywords: ['Java', 'AWS', 'DynamoDB'],
    link: 'https://www.amazon.jobs',
    notes: 'Applied through referral program.',
  },
  {
    position: 'React Developer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    minSalary: 160000,
    maxSalary: 220000,
    status: 'Negotiating',
    dateSaved: new Date('2025-01-10'),
    dateApplied: new Date('2025-01-12'),
    excitement: 5,
    jobDescription: 'Build streaming platform UI components.',
    keywords: ['React', 'Redux', 'Testing'],
    link: 'https://jobs.netflix.com',
    notes: 'Offer received! Negotiating salary and equity.',
  },
  {
    position: 'DevOps Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    minSalary: 140000,
    maxSalary: 180000,
    status: 'Applying',
    dateSaved: new Date('2025-02-10'),
    deadline: new Date('2025-02-28'),
    excitement: 4,
    keywords: ['Kubernetes', 'Docker', 'CI/CD'],
    link: 'https://stripe.com/jobs',
    notes: 'Need to complete coding assessment.',
  },
  {
    position: 'UI/UX Developer',
    company: 'Airbnb',
    location: 'Remote',
    minSalary: 125000,
    maxSalary: 165000,
    status: 'Not Selected',
    dateSaved: new Date('2024-12-15'),
    dateApplied: new Date('2024-12-20'),
    excitement: 4,
    keywords: ['React', 'CSS', 'Figma'],
    link: 'https://careers.airbnb.com',
    notes: 'Rejected after final round. They wanted more design experience.',
  },
  {
    position: 'Platform Engineer',
    company: 'Uber',
    location: 'Chicago, IL',
    minSalary: 135000,
    maxSalary: 175000,
    status: 'I Withdrew',
    dateSaved: new Date('2025-01-05'),
    dateApplied: new Date('2025-01-08'),
    excitement: 3,
    keywords: ['Go', 'Kubernetes', 'gRPC'],
    link: 'https://www.uber.com/careers',
    notes: 'Withdrew after receiving better offer from Netflix.',
  },
  {
    position: 'Senior Software Engineer',
    company: 'Spotify',
    location: 'New York, NY',
    minSalary: 145000,
    maxSalary: 190000,
    status: 'Interviewing',
    dateSaved: new Date('2025-02-01'),
    dateApplied: new Date('2025-02-03'),
    followUp: new Date('2025-02-20'),
    excitement: 5,
    jobDescription: 'Work on music recommendation algorithms.',
    keywords: ['Python', 'Machine Learning', 'Data'],
    link: 'https://www.spotifyjobs.com',
    notes: 'System design interview coming up.',
  },
  {
    position: 'Frontend Engineer',
    company: 'LinkedIn',
    location: 'Sunnyvale, CA',
    minSalary: 140000,
    maxSalary: 185000,
    status: 'No Response',
    dateSaved: new Date('2024-11-20'),
    dateApplied: new Date('2024-11-25'),
    excitement: 3,
    keywords: ['React', 'TypeScript', 'A11y'],
    link: 'https://careers.linkedin.com',
    notes: 'Applied 3 months ago, no response.',
  },
  {
    position: 'Staff Engineer',
    company: 'Shopify',
    location: 'Remote',
    minSalary: 170000,
    maxSalary: 230000,
    status: 'Accepted',
    dateSaved: new Date('2024-12-01'),
    dateApplied: new Date('2024-12-05'),
    excitement: 5,
    jobDescription: 'Lead frontend architecture for merchant dashboard.',
    keywords: ['React', 'Ruby', 'GraphQL'],
    link: 'https://www.shopify.com/careers',
    notes: '🎉 Accepted the offer! Starting next month.',
  },
  {
    position: 'Software Developer',
    company: 'Slack',
    location: 'Denver, CO',
    minSalary: 130000,
    maxSalary: 170000,
    status: 'Bookmarked',
    dateSaved: new Date('2025-02-15'),
    excitement: 4,
    keywords: ['Electron', 'React', 'WebSocket'],
    link: 'https://slack.com/careers',
    notes: 'Desktop app team position. Will apply next week.',
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Delete existing jobs
  await prisma.job.deleteMany();
  console.log('🗑️  Cleared existing jobs');

  // Create sample jobs
  for (const job of sampleJobs) {
    await prisma.job.create({
      data: job,
    });
  }

  console.log(`✅ Created ${sampleJobs.length} sample jobs`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
