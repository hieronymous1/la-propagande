'use client';

import { useState } from 'react';

export default function ContributionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    const data = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          inquiryType: 'archive',
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }
      setSubmitted(true);
      form.reset();
    } catch {
      setError('Delivery failed. Please retry or email your contribution directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="lp-panel lp-panel--accent lp-reveal space-y-2 p-4" role="status">
        <span className="lp-received-stamp">TRANSMISSION RECEIVED</span>
        <p className="lp-body lp-body-sm m-0">Your fragment is in the recovery queue. We review every submission by hand.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block space-y-[6px]">
          <span className="lp-log block text-[var(--lp-color-text-muted)]">NAME <span className="text-[var(--lp-color-primary-400)]">*</span></span>
          <input type="text" name="name" required autoComplete="name" className="lp-input" />
        </label>
      <label className="block space-y-[6px]">
          <span className="lp-log block text-[var(--lp-color-text-muted)]">EMAIL <span className="text-[var(--lp-color-primary-400)]">*</span></span>
          <input type="email" name="email" required autoComplete="email" className="lp-input" />
        </label>
      <label className="block space-y-[6px]">
          <span className="lp-log block text-[var(--lp-color-text-muted)]">WHAT DID YOU FIND, AND WHERE? <span className="text-[var(--lp-color-primary-400)]">*</span></span>
          <textarea name="message" rows={5} required className="lp-textarea" />
        </label>
      <button
        type="submit"
        disabled={submitting}
        className="lp-btn lp-btn--primary lp-btn--block"
      >
        {submitting ? 'SENDING...' : 'SUBMIT FRAGMENT'}
      </button>
      {error ? <p className="lp-warning-box lp-log m-0" role="alert">{error}</p> : null}
      <a className="lp-btn lp-btn--sm" href="mailto:lapropagandeparisbey@outlook.com?subject=Archive%20contribution">EMAIL DIRECTLY ↗</a>
    </form>
  );
}
