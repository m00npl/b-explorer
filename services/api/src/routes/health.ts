import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { DatabaseClient } from '../database/client';

const router = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const db: DatabaseClient = req.app.locals.db;

  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'beacon-api',
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'unknown'
  };

  try {
    await db.query('SELECT 1');
    healthCheck.database = 'connected';
  } catch (error) {
    healthCheck.database = 'disconnected';
    healthCheck.status = 'degraded';
  }

  const statusCode = healthCheck.status === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    success: true,
    data: healthCheck,
    timestamp: new Date().toISOString()
  });
}));

router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const db: DatabaseClient = req.app.locals.db;
  const stats = await db.getStats();

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
}));

export default router;