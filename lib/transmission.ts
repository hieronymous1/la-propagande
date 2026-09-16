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

export function getTransmission(article: Article): Transmission {
  const status = clean(article.lpMeta?.status) ?? 'ACTIVE';
  const normalizedStatus = status.toUpperCase() === 'ARCHIVE' ? 'COMPLETE' : status.toUpperCase();
  const isLive = normalizedStatus === 'LIVE' || normalizedStatus === 'ACTIVE';
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
