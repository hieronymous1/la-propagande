'use client';

import { useEffect, useState } from 'react';

// Share the initial request across mounts (including React Strict Mode).
let visitRequest: Promise<{ count: number | null } | null> | undefined;

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    visitRequest ??= fetch('/api/visitors', { method: 'POST' })
      .then((response) => response.ok ? response.json() : null).catch(() => null);
    visitRequest
      .then((data) => { if (active && data && typeof data.count === 'number' && Number.isSafeInteger(data.count) && data.count >= 0) setCount(data.count); })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  if (count === null) return null;
  return <span className="lp-log" title="One visit per browser every 24 hours. Tracking started when this counter was enabled.">VISITS · {count.toLocaleString('en-US')}</span>;
}
