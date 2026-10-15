'use client';

import { useState } from 'react';

export default function InstagramPost({ url, title }: { url: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="space-y-3 border-t border-[var(--lp-color-border-subtle)] pt-4">
      <a href={url} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn--sm">VIEW ON INSTAGRAM ↗</a>
      {loaded ? (
        <iframe title={`${title} on Instagram`} src={`${url}embed/`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="w-full border-0" style={{ height: 600, background: '#fff' }} />
      ) : (
        <div className="space-y-2">
          <p className="lp-body lp-body-sm m-0">Load this post to view it here. Instagram may use cookies when loaded.</p>
          <button type="button" className="lp-btn lp-btn--sm" onClick={() => setLoaded(true)}>LOAD INSTAGRAM POST</button>
        </div>
      )}
    </div>
  );
}
