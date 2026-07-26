import type { ReviewInsights, Sentiment } from '@/types';

/**
 * Sentiment + summary generation for an incoming testimonial.
 *
 * This is a deterministic, dependency-free heuristic — a stand-in for a model
 * call. It is isolated behind `analyseReview` so swapping in a real provider is
 * a one-function change: keep the signature, make the body `await` the model,
 * and every caller (route handler, seed data, UI badge) keeps working.
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

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
}

/**
 * Scores the message on a roughly [-1, 1] scale, then blends in the star
 * rating — a 1-star review with polite wording is still negative.
 */
function scoreMessage(message: string, rating: number): number {
  const tokens = tokenize(message);
  let score = 0;

  tokens.forEach((token, index) => {
    const polarity = POSITIVE_TERMS.includes(token) ? 1 : NEGATIVE_TERMS.includes(token) ? -1 : 0;
    if (polarity === 0) return;

    const previous = tokens[index - 1];
    const weight = previous && INTENSIFIERS.includes(previous) ? 1.5 : 1;
    const flipped = previous && NEGATORS.includes(previous) ? -1 : 1;

    score += polarity * weight * flipped;
  });

  const lexical = Math.max(-1, Math.min(1, score / 3));
  const ratingSignal = (rating - 3) / 2; // 1 star -> -1, 5 stars -> +1

  // The rating is the stronger signal; wording refines it.
  return ratingSignal * 0.6 + lexical * 0.4;
}

function toSentiment(score: number): Sentiment {
  if (score >= 0.25) return 'positive';
  if (score <= -0.25) return 'negative';
  return 'neutral';
}

/** Picks the most opinionated sentence to quote back in the summary. */
function keySentence(message: string): string {
  const sentences = message
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  if (sentences.length === 0) return message.trim();

  const ranked = sentences
    .map((sentence) => {
      const tokens = tokenize(sentence);
      const hits = tokens.filter(
        (token) => POSITIVE_TERMS.includes(token) || NEGATIVE_TERMS.includes(token),
      ).length;
      return { sentence, hits };
    })
    .sort((a, b) => b.hits - a.hits);

  const best = ranked[0]!.sentence;
  return best.length > 150 ? `${best.slice(0, 147).trimEnd()}...` : best;
}

const SENTIMENT_OPENERS: Record<Sentiment, string> = {
  positive: 'Happy customer',
  neutral: 'Mixed feedback',
  negative: 'Unhappy customer',
};

export function analyseReview(message: string, rating: number, company: string): ReviewInsights {
  const sentiment = toSentiment(scoreMessage(message, rating));
  const summary = `${SENTIMENT_OPENERS[sentiment]} at ${company} (${rating}/5): ${keySentence(message)}`;

  return { sentiment, summary };
}
