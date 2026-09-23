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

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Health check & Enclave Telemetry
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OPERATIONAL',
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
