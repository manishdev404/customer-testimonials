import { CheckCircle2, Clock, Minus, Sparkles, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { SENTIMENT_LABELS, STATUS_LABELS } from '@/constants';
import type { ReviewStatus, Sentiment } from '@/types';
import { Badge, type BadgeTone } from '@/components/ui/badge';

/**
 * Domain-aware badges. Centralised so a status never renders amber in one place
 * and grey in another.
 */

const STATUS_CONFIG: Record<ReviewStatus, { tone: BadgeTone; icon: typeof Clock }> = {
  pending: { tone: 'warning', icon: Clock },
  approved: { tone: 'success', icon: CheckCircle2 },
  rejected: { tone: 'danger', icon: XCircle },
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const { tone, icon: Icon } = STATUS_CONFIG[status];

  return (
    <Badge tone={tone} icon={<Icon className="h-3 w-3" aria-hidden="true" />}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const SENTIMENT_CONFIG: Record<Sentiment, { tone: BadgeTone; icon: typeof ThumbsUp }> = {
  positive: { tone: 'success', icon: ThumbsUp },
  neutral: { tone: 'neutral', icon: Minus },
  negative: { tone: 'danger', icon: ThumbsDown },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const { tone, icon: Icon } = SENTIMENT_CONFIG[sentiment];

  return (
    <Badge tone={tone} icon={<Icon className="h-3 w-3" aria-hidden="true" />}>
      {SENTIMENT_LABELS[sentiment]}
    </Badge>
  );
}

/** Marks content produced by the insights model. */
export function AiBadge() {
  return (
    <Badge tone="accent" icon={<Sparkles className="h-3 w-3" aria-hidden="true" />}>
      AI
    </Badge>
  );
}
