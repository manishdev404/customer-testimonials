import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import type { ReviewInsights } from '../reviews/review.types.js';
import { GroqInsightsProvider } from './groq.provider.js';
import { HeuristicInsightsProvider } from './heuristic.provider.js';
import type { InsightsProvider, InsightsRequest } from './insights.types.js';

/**
 * Chooses an analyser and guarantees a result.
 *
 * The hosted model is best-effort: a testimonial submission must never fail
 * because a third-party API is down, rate-limited or slow, so any error falls
 * through to the local heuristic. `insights.source` records which one ran.
 */
export class InsightsService {
  private readonly primary: InsightsProvider | null;
  private readonly fallback: InsightsProvider = new HeuristicInsightsProvider();

  constructor() {
    this.primary = env.groq.enabled ? new GroqInsightsProvider() : null;

    logger.info(
      this.primary
        ? `AI insights: ${this.primary.name} (${env.groq.model}), heuristic fallback`
        : 'AI insights: heuristic only (set GROQ_API_KEY to enable the model)',
    );
  }

  async analyse(request: InsightsRequest): Promise<ReviewInsights> {
    if (this.primary) {
      try {
        return await this.primary.analyse(request);
      } catch (error) {
        logger.warn(`AI insights: ${this.primary.name} failed, using heuristic`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return this.fallback.analyse(request);
  }
}

export const insightsService = new InsightsService();
