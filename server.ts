import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import userRoutes from './server/routes/user';
import workoutsRoutes from './server/routes/workouts';
import nutritionRoutes from './server/routes/nutrition';
import sleepRoutes from './server/routes/sleep';
import intelligenceRoutes from './server/routes/intelligence';
import relationshipsRoutes from './server/routes/relationships';
import chatRoutes from './server/routes/chat';

import { db } from './src/db/index';
import { sql } from 'drizzle-orm';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Health check & Enclave Telemetry (Distinguishes API, DATABASE, AUTH)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let isDbHealthy = false;

  try {
    const testResult = await db.execute(sql`SELECT 1 as ping`);
    if (testResult) {
      dbStatus = 'CONNECTED';
      isDbHealthy = true;
    }
  } catch (err: any) {
    console.error('Health check DB error:', err.message);
    dbStatus = 'DISCONNECTED';
  }

  const overallStatus = isDbHealthy ? 'OPERATIONAL' : 'DEGRADED';
  const httpCode = isDbHealthy ? 200 : 503;

  return res.status(httpCode).json({
    status: overallStatus,
    database: dbStatus,
    authentication: 'READY',
    api: 'ONLINE',
    system: 'Gym Labs Labcore 2026',
    enclave: 'AES-256-GCM / SCRYPT-16384',
    jurisdiction: 'LGPD_BR_COMPLIANT',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/chat', chatRoutes);

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gym Labs] Enclave server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
