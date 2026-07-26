import { createApp } from './app.js';
import { env } from './config/env.js';
import { verifyFirestoreConnection } from './db/firebase.js';
import { logger } from './lib/logger.js';
import { initImageStore } from './modules/storage/index.js';
import { seedIfEmpty } from './scripts/seed.js';

/**
 * Server bootstrap.
 *
 * Dependencies are verified before the port opens, so a bad credential or an
 * unreachable Firestore surfaces immediately at startup instead of as a 500 on
 * the first request.
 */
async function bootstrap(): Promise<void> {
  await verifyFirestoreConnection();
  await initImageStore();

  if (env.seedOnEmpty) await seedIfEmpty();

  const server = createApp().listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}`, {
      env: env.nodeEnv,
      cors: env.corsOrigins.join(', '),
    });
  });

  // Finish in-flight requests before exiting, so a deploy doesn't cut anyone off.
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => process.exit(0));

    setTimeout(() => {
      logger.warn('Forcing shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to start server', {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
