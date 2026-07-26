import type { ReviewInsights, Sentiment } from '../reviews/review.types.js';
import type { InsightsProvider, InsightsRequest } from './insights.types.js';

/**
 * Deterministic, dependency-free analyser.
 *
 * Serves two purposes: it is the fallback whenever the hosted model is
 * unavailable or rate-limited, and it makes the pipeline testable without a
 * network call.
 */

const POSITIVE_TERMS = [
  'amazing', 'awesome', 'best', 'brilliant', 'delight', 'easy', 'excellent',
  'fantastic', 'flawless', 'great', 'happy', 'impressed', 'incredible', 'intuitive',
  'love', 'loved', 'outstanding', 'perfect', 'polished', 'quick', 'recommend',
  'reliable', 'saved', 'seamless', 'smooth', 'solid', 'superb', 'thrilled', 'wonderful',
];

const NEGATIVE_TERMS = [
  'awful', 'bad', 'broken', 'bug', 'buggy', 'clunky', 'confusing', 'crash',
  'disappointed', 'disappointing', 'expensive', 'fail', 'failed', 'frustrating',
  'glitch', 'hate', 'horrible', 'lacking', 'lost', 'poor', 'refund', 'slow',
  'terrible', 'unreliable', 'unusable', 'useless', 'waste', 'worst',
];

const INTENSIFIERS = ['very', 'extremely', 'really', 'incredibly', 'absolutely'];
const NEGATORS = ['not', 'never', "didn't", 'didnt', "doesn't", 'doesnt', 'no', "wasn't", 'wasnt'];

const SENTIMENT_OPENERS: Record<Sentiment, string> = {
  positive: 'Happy customer',
  neutral: 'Mixed feedback',
  negative: 'Unhappy customer',
};

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/** Blends wording with the star rating; the rating is the stronger signal. */
function score(message: string, rating: number): number {
  const tokens = tokenize(message);
  let lexical = 0;

  tokens.forEach((token, index) => {
    const polarity = POSITIVE_TERMS.includes(token) ? 1 : NEGATIVE_TERMS.includes(token) ? -1 : 0;
    if (polarity === 0) return;

    const previous = tokens[index - 1];
    const weight = previous && INTENSIFIERS.includes(previous) ? 1.5 : 1;
    const flipped = previous && NEGATORS.includes(previous) ? -1 : 1;

    lexical += polarity * weight * flipped;
  });

  const normalisedLexical = Math.max(-1, Math.min(1, lexical / 3));
  const ratingSignal = (rating - 3) / 2; // 1 star -> -1, 5 stars -> +1

  return ratingSignal * 0.6 + normalisedLexical * 0.4;
}

function toSentiment(value: number): Sentiment {
  if (value >= 0.25) return 'positive';
  if (value <= -0.25) return 'negative';
  return 'neutral';
}

/** Quotes back the most opinionated sentence. */
function keySentence(message: string): string {
  const sentences = message
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) return message.trim();

  const ranked = sentences
    .map((sentence) => ({
      sentence,
      hits: tokenize(sentence).filter(
        (token) => POSITIVE_TERMS.includes(token) || NEGATIVE_TERMS.includes(token),
      ).length,
    }))
    .sort((a, b) => b.hits - a.hits);

  const best = ranked[0]!.sentence;
  return best.length > 150 ? `${best.slice(0, 147).trimEnd()}...` : best;
}

export class HeuristicInsightsProvider implements InsightsProvider {
  readonly name = 'heuristic';

  async analyse({ message, rating, company }: InsightsRequest): Promise<ReviewInsights> {
    const sentiment = toSentiment(score(message, rating));

    return {
      sentiment,
      summary: `${SENTIMENT_OPENERS[sentiment]} at ${company} (${rating}/5): ${keySentence(message)}`,
      source: this.name,
    };
  }
}
