'use client';

import { useState } from 'react';

export default function ContributionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
    if (!formId) {
      setError('Archive transmission endpoint is not configured.');
      return;
    }

    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }
      setSubmitted(true);
      e.currentTarget.reset();
    } catch {
      setError('Transmission failed. Please retry in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-2 border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.15)] p-3">
        <p className="font-lp-ui m-0 text-[14px] uppercase text-[var(--lp-color-text-strong)]">TRANSMISSION RECEIVED</p>
        <p className="lp-log m-0 text-[10px]">WE WILL REVIEW YOUR FRAGMENT.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        name="name"
        placeholder="NAME"
        required
        className="w-full border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-dim)] focus:border-[var(--lp-color-border-accent)] focus:outline-none"
      />
      <input
        type="email"
        name="email"
        placeholder="EMAIL"
        required
        className="w-full border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-dim)] focus:border-[var(--lp-color-border-accent)] focus:outline-none"
      />
      <textarea
        name="message"
        placeholder="MESSAGE"
        rows={5}
        required
        className="w-full resize-none border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)] px-3 py-2 text-[11px] uppercase tracking-[0.06em] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-dim)] focus:border-[var(--lp-color-border-accent)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="lp-focus-ring lp-log w-full border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.22)] px-3 py-3 text-[11px] text-[var(--lp-color-text-strong)] hover:border-[var(--lp-color-border-accent-bright)] disabled:opacity-60"
      >
        {submitting ? 'SENDING...' : 'SUBMIT FRAGMENT'}
      </button>
      {error ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-status-alert)]">{error}</p> : null}
    </form>
  );
}
