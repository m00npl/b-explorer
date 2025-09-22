import { config } from 'dotenv';
import { BeaconIngestor } from './ingestor';
import { logger } from './utils/logger';

config();

const beaconNodeUrl = process.env.BEACON_NODE_URL || 'https://beacon-nd-239-bkr-free.p2pify.com';
const golemDbUrl = process.env.GOLEM_DB_URL || 'http://localhost:7465';
const pollInterval = parseInt(process.env.POLL_INTERVAL || '12000');

async function main() {
  logger.info('Starting Beacon Chain Ingestor', {
    beaconNodeUrl,
    golemDbUrl,
    pollInterval
  });

  const ingestor = new BeaconIngestor(beaconNodeUrl, golemDbUrl, pollInterval);

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await ingestor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await ingestor.stop();
    process.exit(0);
  });

  try {
    await ingestor.start();
  } catch (error: any) {
    logger.error('Fatal error in ingestor:', error);
    process.exit(1);
  }
}

main().catch((error: any) => {
  logger.error('Unhandled error in main:', error);
  process.exit(1);
});