'use client';

import { useEffect, useRef } from 'react';

/** Native modal supplies focus containment, background inertness and Escape handling. */
export default function RetroDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={ref} aria-label={title} className="lp-retro-dialog" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
      <div className="lp-retro-dialog__bar"><span>{title.toUpperCase()}</span><button type="button" className="lp-focus-ring" aria-label={`Close ${title}`} onClick={onClose}>×</button></div>
      <div className="lp-retro-dialog__body">{children}</div>
    </dialog>
  );
}
