'use client';

import { useEffect, useRef, useState } from 'react';
import { COMMERCE_ENABLED } from '@/lib/commerce';

const DISMISSED_KEY = 'lp-demo-notice-dismissed';

export default function DemoNotice() {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const demo = !COMMERCE_ENABLED;

  useEffect(() => {
    if (!demo) return;
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISSED_KEY) === 'true'; } catch { /* Storage may be disabled. */ }
    if (!dismissed) dialog.current?.showModal();
  }, [demo]);

  function dismiss() {
    dialog.current?.close();
    try { sessionStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* Dismiss still works without storage. */ }
    opener.current?.focus();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/launch-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ email: data.get('email'), consent: data.get('consent') === 'on', website: data.get('website') }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(typeof result.message === 'string' ? result.message : 'Please try again shortly.');
        return;
      }
      setSubmitted(true);
      form.reset();
    } catch {
      setError('Could not save your email. Please try again shortly.');
    } finally {
      setBusy(false);
    }
  }

  if (!demo) return null;

  return (
    <>
      <button ref={opener} type="button" aria-label="Demo · Notify me at launch" onClick={() => dialog.current?.showModal()} className="lp-btn fixed bottom-[calc(var(--lp-dock-h)+16px+env(safe-area-inset-bottom))] right-3 z-40 max-w-[calc(100%-104px)] bg-[var(--lp-color-bg-1)] shadow-lg md:bottom-3">
        <span className="hidden md:inline">Demo · </span>Notify me at launch
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="demo-notice-title"
        aria-describedby="demo-notice-description"
        onCancel={(event) => { event.preventDefault(); dismiss(); }}
        onClick={(event) => { if (event.target === event.currentTarget) dismiss(); }}
        className="m-auto max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-lg overflow-y-auto border border-[var(--lp-color-border-accent)] bg-[var(--lp-color-bg-1)] p-0 text-[var(--lp-color-text-main)] backdrop:bg-black/80"
      >
        <div className="space-y-5 p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id="demo-notice-title" className="lp-title lp-title-lg m-0">The website is still in the works.</h2>
            <button type="button" onClick={dismiss} aria-label="Close demo notice" className="lp-btn shrink-0">×</button>
          </div>
          <p id="demo-notice-description" className="lp-body m-0">This is a demo version. You can’t order yet.</p>
          {submitted ? (
            <p role="status" className="lp-body">Thank you. We will email you when ordering opens.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="lp-body m-0">Add your email to be notified when it will be done.</p>
              <label className="block space-y-2">
                <span className="lp-label">Email</span>
                <input name="email" type="email" autoComplete="email" maxLength={254} required className="lp-input" />
              </label>
              <div className="hidden" aria-hidden="true"><label>Leave blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
              <label className="lp-body lp-body-sm flex items-start gap-3">
                <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--lp-color-primary-500)]" />
                <span>I agree to receive an email when the shop launches. My email will only be used for this notification.</span>
              </label>
              <button type="submit" disabled={busy} className="lp-btn lp-btn--primary lp-btn--block">{busy ? 'Saving…' : 'Notify me'}</button>
              {error && <p role="alert" className="lp-body lp-body-sm text-[var(--lp-color-status-alert)]">{error}</p>}
            </form>
          )}
          <button type="button" onClick={dismiss} className="lp-btn lp-btn--block">Close and explore</button>
        </div>
      </dialog>
    </>
  );
}
