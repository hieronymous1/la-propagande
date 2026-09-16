'use client';

import { useState } from 'react';

const JACKET_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
const FIT_PREFERENCES = ['Regular', 'Oversize', 'Long Cut', 'Short Cut'] as const;
const COLOR_PREFERENCES = [
  'Flecktarn',
  'Jigsaw',
  'Woodland',
  'Desert Mission',
  'Digital Camo',
  'Multicam',
  'Vegetato',
  'Denim',
  'Olive Green',
] as const;
const PRINT_OPTIONS = ['Graffiti Logo', 'Time of Monsters', 'Atlas', 'Anger Is a Gift', 'Fuck the System'] as const;
const EMBROIDERY_OPTIONS = [
  'Eyes Behind My Back',
  'Anger Is a Gift',
  'Uncle Sami',
  'Che Position Vacant',
  'Che Position Lebanese Version',
] as const;
const PATCH_OPTIONS = ['Metal', 'Cartoons', 'Sports', 'Flags'] as const;

function toCsv(values: FormDataEntryValue[]) {
  return values
    .map((value) => String(value).trim())
    .filter(Boolean)
    .join(', ');
}

type ChoiceBoxProps = {
  name: string;
  value: string;
  type: 'radio' | 'checkbox';
};

function ChoiceBox({ name, value, type }: ChoiceBoxProps) {
  const id = `${name}-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <label
      htmlFor={id}
      className="lp-toggle lp-focus-ring group relative min-h-[46px] cursor-pointer px-3 py-2 text-center has-[:checked]:border-[var(--lp-color-primary-500)] has-[:checked]:bg-[rgba(142,17,17,0.22)] has-[:checked]:text-[var(--lp-color-text-strong)] has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-[var(--lp-color-primary-400)]"
    >
      <input id={id} type={type} name={name} value={value} className="peer sr-only" />
      <span className="text-center">{value}</span>
    </label>
  );
}

export default function CustomJacketInquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const endpoint =
      process.env.NEXT_PUBLIC_CUSTOM_JACKETS_FORM_ENDPOINT ||
      'https://formsubmit.co/ajax/lapropagandeparisbey@outlook.com';

    const data = new FormData(event.currentTarget);
    setSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'New Custom Jacket Inquiry',
          _captcha: 'false',
          _template: 'table',
          inquiryType: 'custom-jackets',
          name: data.get('name'),
          email: data.get('email'),
          phoneWhatsapp: data.get('phoneWhatsapp'),
          city: data.get('city'),
          jacketSize: data.get('jacketSize'),
          fitPreference: data.get('fitPreference'),
          colorPreference: toCsv(data.getAll('colorPreference')),
          reference: data.get('reference'),
          prints: toCsv(data.getAll('prints')),
          embroideries: toCsv(data.getAll('embroideries')),
          patches: toCsv(data.getAll('patches')),
          patchQuantity: data.get('patchQuantity'),
          notes: data.get('notes'),
          consent: data.get('consent') === 'on',
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      setSubmitted(true);
      event.currentTarget.reset();
    } catch {
      setError('Inquiry transmission failed. Please retry or use Contact.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="lp-panel lp-panel--accent lp-reveal space-y-2 p-4" role="status">
        <p className="lp-display lp-display-sm m-0 text-[var(--lp-color-text-strong)]">Inquiry Received</p>
        <p className="lp-body m-0">
          We manually review each custom request. Next step is a curated follow-up with jacket, print, and patch options that fit your direction.
        </p>
      </div>
    );
  }

  const textInputClass = 'lp-input';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-2 md:grid-cols-2">
        <input type="text" name="name" placeholder="Name *" required className={textInputClass} />
        <input type="email" name="email" placeholder="Email *" required className={textInputClass} />
        <input type="text" name="phoneWhatsapp" placeholder="Phone / WhatsApp" className={textInputClass} />
        <input type="text" name="city" placeholder="City" className={textInputClass} />
        <input type="text" name="reference" placeholder="Reference" className={textInputClass} />
        <input
          type="number"
          name="patchQuantity"
          min={0}
          step={1}
          placeholder="Patch Quantity"
          className={textInputClass}
          inputMode="numeric"
        />
      </div>

      <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
        <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Jacket Size</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {JACKET_SIZES.map((value) => (
            <ChoiceBox key={value} name="jacketSize" value={value} type="radio" />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
        <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Fit Preference</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FIT_PREFERENCES.map((value) => (
            <ChoiceBox key={value} name="fitPreference" value={value} type="radio" />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
        <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Color Preference</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {COLOR_PREFERENCES.map((value) => (
            <ChoiceBox key={value} name="colorPreference" value={value} type="checkbox" />
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 md:grid-cols-2">
        <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
          <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Prints</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRINT_OPTIONS.map((value) => (
              <ChoiceBox key={value} name="prints" value={value} type="checkbox" />
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
          <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Embroideries</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EMBROIDERY_OPTIONS.map((value) => (
              <ChoiceBox key={value} name="embroideries" value={value} type="checkbox" />
            ))}
          </div>
        </fieldset>
      </div>

      <fieldset className="space-y-2 border border-[var(--lp-color-border-subtle)] p-3">
        <legend className="lp-label px-1 text-[var(--lp-color-primary-400)]">Patches</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PATCH_OPTIONS.map((value) => (
            <ChoiceBox key={value} name="patches" value={value} type="checkbox" />
          ))}
        </div>
      </fieldset>

      <textarea
        name="notes"
        placeholder="Notes"
        rows={4}
        className="lp-textarea"
      />

      <label className="lp-body lp-body-sm flex items-start gap-3 border border-[var(--lp-color-border-subtle)] bg-[rgba(0,0,0,0.25)] px-3 py-3">
        <input type="checkbox" name="consent" required className="mt-[3px] h-4 w-4 shrink-0 accent-[var(--lp-color-primary-500)]" />
        <span>I agree to be contacted about this custom jackets inquiry and understand all options are curated manually after submission.</span>
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="lp-btn lp-btn--primary lp-btn--lg lp-btn--block"
      >
        {submitting ? 'Sending Inquiry...' : 'Submit Custom Jackets Inquiry'}
      </button>

      {error ? <p className="lp-warning-box lp-log m-0" role="alert">{error}</p> : null}
    </form>
  );
}
