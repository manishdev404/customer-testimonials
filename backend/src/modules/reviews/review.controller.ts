import type { Request, Response } from 'express';
import { sendOk } from '../../lib/api-response.js';
import { HttpError } from '../../lib/http-error.js';
import {
  createReviewSchema,
  reviewQuerySchema,
  toFieldErrors,
  updateReviewSchema,
} from './review.schema.js';
import { reviewService } from './review.service.js';

/**
 * HTTP boundary: parse, delegate, respond. No business rules live here — the
 * controller's only job is translating between the wire and the service.
 */
export const reviewController = {
  async list(req: Request, res: Response): Promise<void> {
    // `.catch()` on each field means a malformed filter falls back to its
    // default instead of failing a dashboard load.
    const query = reviewQuerySchema.parse(req.query);
    sendOk(res, await reviewService.list(query));
  },

  async listPublic(_req: Request, res: Response): Promise<void> {
    sendOk(res, await reviewService.listPublic());
  },

  async getById(req: Request, res: Response): Promise<void> {
    sendOk(res, await reviewService.getById(req.params.id as string));
  },

  async create(req: Request, res: Response): Promise<void> {
    const parsed = createReviewSchema.safeParse(req.body);

    if (!parsed.success) {
      throw HttpError.unprocessable(
        'Please correct the highlighted fields.',
        toFieldErrors(parsed.error),
      );
    }

    sendOk(res, await reviewService.create(parsed.data), 201);
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const parsed = updateReviewSchema.safeParse(req.body);

    if (!parsed.success) {
      throw HttpError.unprocessable('Invalid status.', toFieldErrors(parsed.error));
    }

    sendOk(res, await reviewService.updateStatus(req.params.id as string, parsed.data.status));
  },
};
