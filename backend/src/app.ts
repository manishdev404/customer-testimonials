import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { sendOk } from './lib/api-response.js';
import { HttpError } from './lib/http-error.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestLogger } from './middleware/request-logger.js';
import { getImageStore } from './modules/storage/index.js';
import { reviewRoutes, testimonialRoutes } from './modules/reviews/review.routes.js';

/**
 * Builds the Express app. Kept separate from the server bootstrap so tests can
 * mount it without binding a port.
 */
export function createApp(): Express {
  const app = express();

  // Behind a proxy on Render/Railway/Fly, so client IPs and protocol are read
  // from X-Forwarded-* headers.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin and server-to-server calls arrive without an Origin.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);

        // A plain Error here would surface as a 500 and be logged as a bug.
        // A disallowed origin is an expected, client-side condition.
        callback(new HttpError(`Origin ${origin} is not allowed by CORS.`, 403));
      },
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    }),
  );

  // Base64 images travel in the JSON body, so the default 100kb limit is far
  // too small. The cap still bounds what a single request can cost us.
  app.use(express.json({ limit: '15mb' }));
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    sendOk(res, {
      status: 'ok',
      uptime: Math.round(process.uptime()),
      imageStore: getImageStore().kind,
      aiInsights: env.groq.enabled ? env.groq.model : 'heuristic',
    });
  });

  app.use('/api/reviews', reviewRoutes);
  app.use('/api/testimonials', testimonialRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
