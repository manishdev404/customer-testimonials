import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';

/**
 * Logs each request once it completes, so the line carries the real status code
 * and duration rather than guessing up front.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(0)}ms`;

    if (res.statusCode >= 500) logger.error(line);
    else if (res.statusCode >= 400) logger.warn(line);
    else logger.info(line);
  });

  next();
}
