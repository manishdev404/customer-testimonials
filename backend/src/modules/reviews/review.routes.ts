import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { reviewController } from './review.controller.js';

/**
 * Admin-facing routes. The assignment scopes out authentication, so these are
 * intentionally unprotected — in a real deployment this router would sit behind
 * session middleware.
 */
export const reviewRoutes: Router = Router();

reviewRoutes.get('/', asyncHandler(reviewController.list));
reviewRoutes.post('/', asyncHandler(reviewController.create));
reviewRoutes.get('/:id', asyncHandler(reviewController.getById));
reviewRoutes.patch('/:id', asyncHandler(reviewController.updateStatus));

/** Public, read-only feed of approved testimonials. */
export const testimonialRoutes: Router = Router();

testimonialRoutes.get('/', asyncHandler(reviewController.listPublic));
