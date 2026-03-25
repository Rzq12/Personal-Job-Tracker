<p align="center">
  <img src="public/favicon.svg" alt="Job Tracker logo" width="72" />
</p>

<h1 align="center">Job Tracker</h1>

<p align="center">
  Modern fullstack job application tracker with authentication, pipeline analytics, and Excel export.
</p>

<p align="center">
  <a href="https://job-tracker.riezqidr.my.id">Live demo</a>
</p>

## Overview

Job Tracker helps you manage applications from bookmark to final decision in one place. The app uses a React frontend and Vercel serverless API with Prisma.

## Features

- Secure auth flow (register, login, token refresh, profile update, password change)
- Pipeline-based job tracking with search, filters, sorting, and pagination
- Responsive dashboard and tracker views for desktop and mobile
- Bulk selection, status updates, notes, star rating, and archived workflow
- Dashboard stats and monthly trend aggregation
- Excel export for filtered job data
- Demo mode fallback when `DATABASE_URL` is not configured

## Tech Stack

- Frontend: React 19, Vite 7, TypeScript, Tailwind CSS v4
- Data fetching: TanStack Query v5
- API: Vercel Serverless Functions
- Database and ORM: PostgreSQL + Prisma
- Auth: JWT access token (15m) + refresh token (7d)
- Testing: Jest + ts-jest (unit and integration)

## Architecture

```text
src/                    React app
api/                    Vercel serverless endpoints
  auth/index.ts         Unified auth actions via query param
  jobs/index.ts         List and create jobs
  jobs/[id].ts          Get, update, delete job
  jobs/export.ts        Excel export endpoint
  stats.ts              Dashboard metrics endpoint
prisma/schema.prisma    User and Job models
dev-server.ts           Local Express adapter for API routes
```

## Local Development

### Requirements

- Node.js 22.x
- npm
- PostgreSQL (optional if you only want demo mode)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
ACCESS_TOKEN_SECRET="replace-with-a-strong-random-secret"
REFRESH_TOKEN_SECRET="replace-with-a-second-strong-random-secret"
VITE_API_URL="http://localhost:3002/api"
```

> [!NOTE]
> If `DATABASE_URL` is missing, API falls back to demo mode for job endpoints.

> [!IMPORTANT]
> Default JWT secrets in code are for development convenience only. Always set secure values in production.

### 3) Initialize database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4) Start app and API

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:3002/api`

## Scripts

| Command                   | Description                           |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Run client and API together           |
| `npm run dev:client`      | Start Vite frontend                   |
| `npm run dev:api`         | Start local API dev server            |
| `npm run build`           | Type-check and build frontend         |
| `npm run preview`         | Preview production build              |
| `npm run lint`            | Run ESLint                            |
| `npm run format`          | Run Prettier                          |
| `npm run prisma:generate` | Generate Prisma client                |
| `npm run prisma:migrate`  | Run Prisma migrations (dev)           |
| `npm run prisma:push`     | Push schema changes without migration |
| `npm run prisma:seed`     | Seed database                         |
| `npm run prisma:studio`   | Open Prisma Studio                    |
| `npm run test`            | Run all tests                         |
| `npm run test:watch`      | Run tests in watch mode               |
| `npm run test:coverage`   | Run tests with coverage report        |
| `npm run test:ci`         | CI test run with coverage             |

## API Quick Reference

### Auth

- `POST /api/auth?action=register`
- `POST /api/auth?action=login`
- `GET /api/auth?action=me`
- `POST /api/auth?action=refresh`
- `POST /api/auth?action=logout`
- `PUT /api/auth?action=update-profile`
- `PUT /api/auth?action=change-password`

### Jobs and Stats

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:id`
- `PUT /api/jobs/:id`
- `DELETE /api/jobs/:id`
- `GET /api/jobs/export`
- `GET /api/stats`

Common `GET /api/jobs` query params: `page`, `size`, `search`, `status`, `archived`, `sort`.

## Deployment (Vercel)

1. Import repository into Vercel.
2. Set environment variables: `DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.
3. Build command: `npm run vercel-build`.
4. Keep SPA rewrites enabled in `vercel.json`:
   - `/api/:path* -> /api/:path*`
   - `/:path* -> /index.html`

## Testing

The project includes unit and integration tests for auth, jobs, export, stats, middleware, and utility layers.

```bash
npm run test:ci
```

## Notes

- Some API handlers set permissive CORS headers for compatibility.
- For production hardening, tighten CORS and manage secrets through platform environment settings.
