import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { sendError } from '../lib/api-response.js';
import { HttpError } from '../lib/http-error.js';
import { logger } from '../lib/logger.js';
import { toFieldErrors } from '../modules/reviews/review.schema.js';

/**
 * Single exit point for every failure. Handlers throw; this decides the status
 * code, the client-facing message and what gets logged.
 *
 * Must keep all four parameters — Express identifies error middleware by arity.
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof HttpError) {
    if (!error.expected) {
      logger.error(`${req.method} ${req.originalUrl} -> ${error.status}`, {
        message: error.message,
      });
    }
    sendError(res, error.message, error.status, error.fields);
    return;
  }

  if (error instanceof ZodError) {
    sendError(res, 'Please correct the highlighted fields.', 422, toFieldErrors(error));
    return;
  }

  // Express's JSON body parser rejects oversized or malformed payloads.
  if (isBodyParserError(error)) {
    const tooLarge = error.type === 'entity.too.large';
    sendError(
      res,
      tooLarge
        ? 'That upload is too large. Please use smaller images.'
        : 'Request body must be valid JSON.',
      tooLarge ? 413 : 400,
    );
    return;
  }

  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Never leak internals to a client in production.
  sendError(
    res,
    env.isProduction ? 'Something went wrong. Please try again.' : message,
    500,
  );
}

interface BodyParserError {
  type: string;
  status?: number;
}

function isBodyParserError(error: unknown): error is BodyParserError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as BodyParserError).type === 'string' &&
    ['entity.too.large', 'entity.parse.failed'].includes((error as BodyParserError).type)
  );
}
