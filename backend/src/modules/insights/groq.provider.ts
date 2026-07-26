import { env } from '../../config/env.js';
import { SENTIMENTS, type ReviewInsights, type Sentiment } from '../reviews/review.types.js';
import type { InsightsProvider, InsightsRequest } from './insights.types.js';

/**
 * Sentiment + summary via Groq's OpenAI-compatible chat completions endpoint.
 *
 * Called with a hard timeout: a moderator's submission must not hang on a slow
 * model, so the service layer falls back to the heuristic provider if this
 * throws for any reason.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = `You analyse customer testimonials for a business dashboard.
Reply with ONLY a JSON object, no markdown fence, matching exactly:
{"sentiment":"positive"|"neutral"|"negative","summary":"<one sentence, max 25 words>"}

Rules:
- Weigh the written text more heavily than the star rating, but let a clear
  mismatch between them (e.g. 5 stars with harsh criticism) push toward neutral.
- The summary must be a factual digest for the business owner, not a quote and
  not marketing copy. Never invent details that are not in the testimonial.`;

interface GroqChoice {
  message?: { content?: string };
}

interface GroqResponse {
  choices?: GroqChoice[];
}

function isSentiment(value: unknown): value is Sentiment {
  return typeof value === 'string' && SENTIMENTS.includes(value as Sentiment);
}

export class GroqInsightsProvider implements InsightsProvider {
  readonly name = 'groq';

  async analyse({ message, rating, company }: InsightsRequest): Promise<ReviewInsights> {
    // AbortSignal.timeout rejects the fetch rather than leaving it pending.
    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.groq.apiKey}`,
      },
      body: JSON.stringify({
        model: env.groq.model,
        temperature: 0.2,
        max_tokens: 200,
        // Guarantees parseable output instead of a prose preamble.
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Company: ${company}\nStar rating: ${rating}/5\nTestimonial: """${message}"""`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Groq responded ${response.status}: ${detail.slice(0, 200)}`);
    }

    const payload = (await response.json()) as GroqResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error('Groq returned an empty completion.');

    const parsed = JSON.parse(content) as { sentiment?: unknown; summary?: unknown };

    if (!isSentiment(parsed.sentiment)) {
      throw new Error(`Groq returned an unexpected sentiment: ${String(parsed.sentiment)}`);
    }
    if (typeof parsed.summary !== 'string' || parsed.summary.trim() === '') {
      throw new Error('Groq returned an empty summary.');
    }

    return {
      sentiment: parsed.sentiment,
      summary: parsed.summary.trim(),
      source: this.name,
    };
  }
}
