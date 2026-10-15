import type { Article } from '@/lib/types';

export function formatTxDate(value: string): string {
  const date = new Date(value);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

export function formatTxDateLong(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function clean(value: string | undefined | null): string | undefined {
  const resolved = value?.trim();
  if (!resolved) return undefined;
  return resolved.replace(/archive/gi, 'recovery');
}

export interface Transmission {
  id: string;
  channel: string;
  category: string;
  status: string;
  location?: string;
  source: string;
  isLive: boolean;
}

const DAY = 86_400_000;
/** a transmission stays on air for this long after it is published, then it is logged */
const ON_AIR_WINDOW_DAYS = 21;

/**
 * Status follows the calendar, not just the CMS flag: a post flagged LIVE in
 * Shopify stops claiming LIVE once its window has passed.
 */
function resolveStatus(rawStatus: string | undefined, publishedAt: string, now = Date.now()): { status: string; isLive: boolean } {
  const flag = rawStatus?.toUpperCase();
  const published = new Date(publishedAt).getTime();
  const age = Number.isFinite(published) ? now - published : 0;

  if (age < 0) return { status: 'UPCOMING', isLive: false };
  if (flag === 'ARCHIVE' || flag === 'COMPLETE' || flag === 'ENDED' || age > ON_AIR_WINDOW_DAYS * DAY) {
    return { status: 'LOGGED', isLive: false };
  }
  if (flag === 'UPCOMING') return { status: 'UPCOMING', isLive: false };
  return { status: 'ON AIR', isLive: true };
}

export function getTransmission(article: Article): Transmission {
  const { status: normalizedStatus, isLive } = resolveStatus(article.lpMeta?.status, article.publishedAt);
  return {
    id: (article.lpMeta?.transmissionId ?? article.id.replace(/[^A-Z0-9]/gi, '').slice(-6)).replace(/^TX-?/i, '').toUpperCase(),
    channel: (clean(article.lpMeta?.channel) ?? article.tags[0] ?? 'BULLETIN').toUpperCase(),
    category: (clean(article.tags[0]) ?? clean(article.lpMeta?.channel) ?? 'EVENT').toUpperCase(),
    status: normalizedStatus,
    location: clean(article.lpMeta?.location)?.toUpperCase(),
    source: (clean(article.lpMeta?.source) ?? article.author?.name ?? 'LA PROPAGANDE').toUpperCase(),
    isLive,
  };
}
