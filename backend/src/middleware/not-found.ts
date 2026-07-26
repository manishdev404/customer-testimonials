import type { Request, Response } from 'express';
import { sendError } from '../lib/api-response.js';

/** Terminal handler: keeps unknown routes on the same response envelope. */
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Cannot ${req.method} ${req.originalUrl}`, 404);
}
