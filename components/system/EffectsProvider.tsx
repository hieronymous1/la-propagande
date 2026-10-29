'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const EffectsContext = createContext({ enabled: false, reduced: false, toggle: () => {} });
const STORAGE_KEY = 'lp-effects';

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const [wanted, setWanted] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const enabled = ready && wanted && !reduced;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    try { setWanted(localStorage.getItem(STORAGE_KEY) !== 'off'); } catch { /* Session-only preference if storage is unavailable. */ }
    setReady(true);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.effects = enabled ? 'on' : 'off';
    document.querySelectorAll<HTMLVideoElement>('video[autoplay]').forEach((video) => {
      if (enabled) void video.play().catch(() => {});
      else video.pause();
    });
  }, [enabled]);

  function toggle() {
    if (reduced) return;
    const next = !wanted;
    setWanted(next);
    try { localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off'); } catch { /* Keep the control usable without storage. */ }
  }

  return <EffectsContext.Provider value={{ enabled, reduced, toggle }}>{children}</EffectsContext.Provider>;
}

export const useEffects = () => useContext(EffectsContext);

export function EffectsToggle() {
  const { enabled, reduced, toggle } = useEffects();
  return (
    <button type="button" className="lp-effects-toggle lp-focus-ring" aria-label="Animated effects" aria-pressed={enabled} aria-disabled={reduced} onClick={toggle} title={reduced ? 'Reduced motion is enabled in your device settings' : 'Switch animated effects on or off'}>
      <span aria-hidden="true">{enabled ? '✳' : '○'}</span> FX: {enabled ? 'ON' : 'OFF'}{reduced ? ' · REDUCED MOTION' : ''}
    </button>
  );
}
