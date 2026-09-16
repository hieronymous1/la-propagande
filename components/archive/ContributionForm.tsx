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
      <div className="lp-panel lp-panel--accent lp-reveal space-y-2 p-4" role="status">
        <p className="lp-display lp-display-sm m-0 text-[var(--lp-color-text-strong)]">Transmission received</p>
        <p className="lp-body lp-body-sm m-0">Your fragment is in the recovery queue. We review every submission by hand.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        className="lp-input"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="lp-input"
      />
      <textarea
        name="message"
        placeholder="What did you find, and where?"
        rows={5}
        required
        className="lp-textarea"
      />
      <button
        type="submit"
        disabled={submitting}
        className="lp-btn lp-btn--primary lp-btn--block"
      >
        {submitting ? 'SENDING...' : 'SUBMIT FRAGMENT'}
      </button>
      {error ? <p className="lp-warning-box lp-log m-0" role="alert">{error}</p> : null}
    </form>
  );
}
