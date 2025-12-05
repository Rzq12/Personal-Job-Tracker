// Simple development server that runs the API endpoints
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Import handlers
import statsHandlerModule from './api/stats';
import jobsHandlerModule from './api/jobs/index';
import jobIdHandlerModule from './api/jobs/[id]';
import exportHandlerModule from './api/jobs/export';

// Extract default export (handle both ESM and CommonJS)
const statsHandler = (statsHandlerModule as any).default || statsHandlerModule;
const jobsHandler = (jobsHandlerModule as any).default || jobsHandlerModule;
const jobIdHandler = (jobIdHandlerModule as any).default || jobIdHandlerModule;
const exportHandler = (exportHandlerModule as any).default || exportHandlerModule;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper to adapt Vercel handlers to Express
const adaptHandler = (handler: Function) => {
  return async (req: express.Request, res: express.Response) => {
    // Add query params from URL
    req.query = { ...req.query, ...req.params };
    await handler(req, res);
  };
};

// Routes
app.all('/api/stats', adaptHandler(statsHandler));
app.all('/api/jobs/export', adaptHandler(exportHandler));
app.all('/api/jobs/:id', (req, res) => {
  req.query.id = req.params.id;
  adaptHandler(jobIdHandler)(req, res);
});
app.all('/api/jobs', adaptHandler(jobsHandler));

app.listen(PORT, () => {
  console.log(`🚀 Dev API server running at http://localhost:${PORT}`);
  console.log(`📝 Demo mode: ${!process.env.DATABASE_URL ? 'ENABLED' : 'DISABLED'}`);
});
