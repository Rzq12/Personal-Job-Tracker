# Job Tracker

A fullstack job application tracker built with React (Vite) and Node.js/Express serverless functions, deployable to Vercel.

## Features

### Dashboard

- **Metric Cards**: Total Applied, Interview, Rejected, Accepted
- **Monthly Chart**: Bar chart showing applications per month
- **Status Distribution**: Progress bars for each status
- **Work Type Breakdown**: WFO, Hybrid, Remote statistics

### Job Applications Table

- **Sortable columns**: Date, Company, Position, Work Type, Status
- **Pagination**: Customizable page size (5, 10, 20, 50)
- **Search**: Multi-field search (company + position)
- **Filters**: Status and Work Type filters
- **Row actions**: Edit, Delete, Open Link
- **Colored badges**: Visual status and work type indicators

### CRUD Operations

- **Create/Edit Modal**: Form with validation
- **Delete Confirmation**: Safe deletion with confirmation dialog
- **Real-time updates**: React Query for cache invalidation

### Export to Excel

- **Server-side generation**: Using exceljs
- **Filtered export**: Export current filtered results
- **Styled output**: Colored cells for status and work type

## Tech Stack

| Category         | Technology                        |
| ---------------- | --------------------------------- |
| Frontend         | React 19, Vite, TypeScript        |
| Styling          | Tailwind CSS v4                   |
| State Management | React Query (TanStack Query)      |
| Backend          | Node.js, Express-style handlers   |
| Database         | PostgreSQL (Supabase recommended) |
| ORM              | Prisma                            |
| Excel Export     | exceljs                           |
| Deployment       | Vercel (Serverless Functions)     |

## Project Structure

```
my-job-tracker/
├── api/                    # Serverless functions (Vercel)
│   ├── jobs/
│   │   ├── index.ts        # GET (list) / POST (create)
│   │   ├── [id].ts         # GET / PUT / DELETE by ID
│   │   └── export.ts       # GET export Excel
│   ├── stats.ts            # GET dashboard stats
│   └── lib/
│       ├── prisma.ts       # Prisma client singleton
│       └── types.ts        # Shared TypeScript types
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Sample data seeder
├── src/
│   ├── components/
│   │   ├── ChartMonthly.tsx
│   │   ├── DashboardCards.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── JobForm.tsx
│   │   ├── JobTable.tsx
│   │   ├── StatusBreakdown.tsx
│   │   └── WorkTypeBreakdown.tsx
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   ├── hooks.ts        # React Query hooks
│   │   └── types.ts        # TypeScript types
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Jobs.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
├── vercel.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd my-job-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your database URL:

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run migrations (creates tables)
   npm run prisma:migrate

   # Seed sample data (optional)
   npm run prisma:seed
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Using Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection string
3. Copy the connection string and add it to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

## API Endpoints

### Jobs

| Method | Endpoint           | Description                                |
| ------ | ------------------ | ------------------------------------------ |
| GET    | `/api/jobs`        | List jobs with pagination, search, filters |
| POST   | `/api/jobs`        | Create a new job                           |
| GET    | `/api/jobs/:id`    | Get a single job                           |
| PUT    | `/api/jobs/:id`    | Update a job                               |
| DELETE | `/api/jobs/:id`    | Delete a job                               |
| GET    | `/api/jobs/export` | Export to Excel                            |

### Stats

| Method | Endpoint     | Description              |
| ------ | ------------ | ------------------------ |
| GET    | `/api/stats` | Get dashboard statistics |

### Query Parameters for GET /api/jobs

| Parameter  | Type   | Description                                               |
| ---------- | ------ | --------------------------------------------------------- |
| `page`     | number | Page number (default: 1)                                  |
| `size`     | number | Items per page (default: 10)                              |
| `search`   | string | Search by company or position                             |
| `status`   | string | Filter by status (Waiting, Interview, Rejected, Accepted) |
| `workType` | string | Filter by work type (WFO, Hybrid, Remote)                 |
| `fromDate` | string | Filter from date (ISO format)                             |
| `toDate`   | string | Filter to date (ISO format)                               |
| `sort`     | string | Sort field (prefix `-` for descending)                    |

### Example Requests

```bash
# Get jobs with pagination and search
curl "http://localhost:5173/api/jobs?page=1&size=10&search=FIF&status=Waiting"

# Create a new job
curl -X POST "http://localhost:5173/api/jobs" \
  -H "Content-Type: application/json" \
  -d '{
    "appliedDate": "2025-01-15",
    "company": "Tokopedia",
    "position": "Software Engineer",
    "workType": "Remote",
    "status": "Waiting",
    "progress": "Submitted",
    "link": "https://tokopedia.com/careers",
    "notes": "Applied via company website"
  }'

# Export filtered jobs to Excel
curl -O "http://localhost:5173/api/jobs/export?status=Accepted"
```

## Database Schema

```prisma
model Job {
  id          Int      @id @default(autoincrement())
  appliedDate DateTime
  company     String
  position    String
  workType    String   // "WFO" | "Hybrid" | "Remote"
  progress    String?  // "Submitted" | "Test Passed" | "Interview Scheduled" | "Final Round"
  status      String   // "Waiting" | "Rejected" | "Accepted" | "Interview"
  link        String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Deploy to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI

   ```bash
   npm i -g vercel
   ```

2. Login and deploy

   ```bash
   vercel login
   vercel
   ```

3. Set environment variables in Vercel Dashboard
   - `DATABASE_URL`: Your PostgreSQL connection string

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL`
5. Deploy!

### Important Notes

- Make sure `DATABASE_URL` is set in Vercel environment variables
- Use Supabase or other cloud PostgreSQL providers for production
- The `/api` folder will automatically become serverless functions

## Scripts

| Command                   | Description               |
| ------------------------- | ------------------------- |
| `npm run dev`             | Start development server  |
| `npm run build`           | Build for production      |
| `npm run preview`         | Preview production build  |
| `npm run lint`            | Run ESLint                |
| `npm run format`          | Format code with Prettier |
| `npm run prisma:generate` | Generate Prisma client    |
| `npm run prisma:migrate`  | Run database migrations   |
| `npm run prisma:push`     | Push schema changes       |
| `npm run prisma:seed`     | Seed sample data          |
| `npm run prisma:studio`   | Open Prisma Studio        |

## Environment Variables

| Variable       | Required | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string                 |
| `VITE_API_URL` | No       | API base URL (leave empty for relative path) |

## License

MIT
