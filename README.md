# Job Tracker

A modern, fullstack job application tracker built with React (Vite) and Vercel Serverless Functions. Track your job applications with a beautiful UI inspired by Teal HQ.

🌐 **Live Demo**: [job-tracker.riezqidr.my.id](https://job-tracker.riezqidr.my.id)

tes saja

## ✨ Features

### Pipeline View

- **Visual Pipeline**: Track jobs through stages (Bookmarked → Applying → Applied → Interviewing → Negotiating → Accepted)
- **Status Bar**: Real-time count of jobs in each pipeline stage
- **Quick Status Updates**: Change job status directly from dropdown

### Job Management

- **Add/Edit Jobs**: Comprehensive form with position, company, salary range, dates, and notes
- **Job Detail Panel**: Side panel with full job information
- **Excitement Rating**: 5-star rating system for job interest level
- **Bulk Actions**: Select multiple jobs for batch operations

### Table Features

- **Sortable Columns**: Sort by any column (Date, Company, Position, Status, etc.)
- **Search**: Real-time search across company and position
- **Column Visibility**: Show/hide columns with dropdown toggle
- **Row Selection**: Checkbox selection with select all option
- **Click to View**: Click any row to see job details

### Modern UI/UX

- **Smooth Animations**: Modal open/close animations with fade and scale effects
- **Responsive Design**: Works on desktop and mobile
- **Clean Interface**: Minimalist design with teal accent color
- **Date Format**: DD/MM/YY format for easy reading

## 🛠 Tech Stack

| Category         | Technology                  |
| ---------------- | --------------------------- |
| Frontend         | React 19, Vite, TypeScript  |
| Styling          | Tailwind CSS v4             |
| State Management | TanStack React Query v5     |
| Backend          | Vercel Serverless Functions |
| Database         | Prisma Postgres (Vercel)    |
| ORM              | Prisma                      |
| Deployment       | Vercel                      |

## 📁 Project Structure

```
my-job-tracker/
├── api/                        # Vercel Serverless Functions
│   ├── jobs/
│   │   ├── index.ts            # GET (list) / POST (create)
│   │   ├── [id].ts             # GET / PUT / DELETE by ID
│   │   └── export.ts           # GET export Excel
│   ├── stats.ts                # GET dashboard stats
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── types.ts            # Shared TypeScript types
│   └── package.json            # API dependencies
├── prisma/
│   └── schema.prisma           # Database schema
├── src/
│   ├── components/
│   │   ├── AddJobModal.tsx     # Add/Edit job modal with animations
│   │   ├── ColumnsDropdown.tsx # Column visibility toggle
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── GroupByDropdown.tsx # Group jobs by status
│   │   ├── JobDetailPanel.tsx  # Side panel for job details
│   │   ├── MenuDropdown.tsx    # Actions menu
│   │   ├── PipelineStatusBar.tsx # Visual pipeline stages
│   │   ├── StarRating.tsx      # 5-star rating component
│   │   └── StatusDropdown.tsx  # Status filter dropdown
│   ├── lib/
│   │   ├── api.ts              # API client functions
│   │   ├── hooks.ts            # React Query hooks
│   │   └── types.ts            # TypeScript types
│   ├── pages/
│   │   └── JobTracker.tsx      # Main job tracker page
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Global styles & animations
├── .env.example
├── package.json
├── vercel.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Vercel Postgres or Supabase)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Rzq12/Personal-Job-Tracker.git
   cd Personal-Job-Tracker/my-job-tracker
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

## 📊 Job Status Flow

```
Bookmarked → Applying → Applied → Interviewing → Negotiating → Accepted
                                                              ↓
                                        I Withdrew / Not Selected / No Response
                                                              ↓
                                                          Archived
```

## 🔌 API Endpoints

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

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| `page`    | number | Page number (default: 1)         |
| `size`    | number | Items per page (default: 10)     |
| `search`  | string | Search by company or position    |
| `status`  | string | Filter by status                 |
| `sort`    | string | Sort field (prefix `-` for desc) |

## 📦 Database Schema

```prisma
model Job {
  id             Int       @id @default(autoincrement())
  position       String
  company        String
  location       String?
  minSalary      Int?
  maxSalary      Int?
  status         String    @default("Bookmarked")
  dateSaved      DateTime  @default(now())
  deadline       DateTime?
  dateApplied    DateTime?
  followUp       DateTime?
  excitement     Int       @default(3)
  jobDescription String?
  keywords       String[]
  link           String?
  notes          String?
  archived       Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

## 🚢 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repository
4. Add environment variables:
   - `DATABASE_URL` - Your PostgreSQL connection string
5. Deploy!

### Using Vercel Postgres

1. In Vercel Dashboard, go to Storage → Create Database
2. Select "Postgres" and create
3. Copy the connection string to your environment variables
4. Run migrations: `npx prisma migrate deploy`

## 📜 Scripts

| Command                   | Description              |
| ------------------------- | ------------------------ |
| `npm run dev`             | Start development server |
| `npm run build`           | Build for production     |
| `npm run preview`         | Preview production build |
| `npm run lint`            | Run ESLint               |
| `npm run prisma:generate` | Generate Prisma client   |
| `npm run prisma:migrate`  | Run database migrations  |
| `npm run prisma:push`     | Push schema changes      |
| `npm run prisma:studio`   | Open Prisma Studio       |

## 📄 License

MIT

---

Made with ❤️ by [Rzq12](https://github.com/Rzq12)
