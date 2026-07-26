import type { Response } from 'express';

/**
 * Response envelope. Identical in shape to the one the Next.js frontend's HTTP
 * client already unwraps, so pointing the frontend at this service is a base
 * URL change and nothing more.
 */
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; fields?: Record<string, string> } };

export function sendOk<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  fields?: Record<string, string>,
): void {
  const body: ApiResponse<never> = {
    success: false,
    error: fields ? { message, fields } : { message },
  };
  res.status(status).json(body);
}
