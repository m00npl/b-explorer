import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/logger';
import { DatabaseClient } from './database/client';
import { errorHandler } from './middleware/error-handler';

import slotsRouter from './routes/slots';
import validatorsRouter from './routes/validators';
import epochsRouter from './routes/epochs';
import healthRouter from './routes/health';

config();

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT || 3001;

const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW || '900000');
const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100');

const limiter = rateLimit({
  windowMs: rateLimitWindow,
  max: rateLimitMax,
  message: {
    error: 'Too many requests',
    message: `Rate limit exceeded. Max ${rateLimitMax} requests per ${rateLimitWindow / 1000} seconds.`
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiter);

app.use('/api/v1/health', healthRouter);
app.use('/api/v1/slots', slotsRouter);
app.use('/api/v1/validators', validatorsRouter);
app.use('/api/v1/epochs', epochsRouter);

app.use(errorHandler);

let dbClient: DatabaseClient;

async function startServer() {
  try {
    const golemDbUrl = process.env.GOLEM_DB_URL || 'http://localhost:7465';
    dbClient = new DatabaseClient(golemDbUrl);
    await dbClient.connect();

    app.locals.db = dbClient;

    app.listen(port, () => {
      logger.info(`Beacon API server running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  if (dbClient) {
    await dbClient.disconnect();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  if (dbClient) {
    await dbClient.disconnect();
  }
  process.exit(0);
});

startServer().catch((error) => {
  logger.error('Unhandled error in startServer:', error);
  process.exit(1);
});