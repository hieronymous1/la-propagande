import Image from 'next/image';
import Link from 'next/link';
import CustomJacketInquiryForm from '@/components/custom/CustomJacketInquiryForm';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';
import { CUSTOM_JACKETS_GALLERY } from '@/lib/site';

export default function CustomJacketsPage() {
  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>CUSTOM JACKETS / BESPOKE TRACK / REQUEST LINE ACTIVE</StatusStrip>

      <Panel>
        <PanelTitleBar title="CUSTOM JACKETS" meta="BESPOKE SERVICE" />
        <div className="space-y-3 p-[10px]">
          <h1 className="font-lp-ui m-0 text-[26px] uppercase leading-[1.1] text-[var(--lp-color-text-strong)]">Custom Jackets</h1>
          <p className="lp-content-copy m-0 text-[14px] text-[var(--lp-color-text-main)]">
            This is a dedicated custom jacket service. Submit your direction, references, and fit details, then we follow up manually with a curated selection of available jackets, prints, and patches.
          </p>
          <ul className="m-0 list-none space-y-1 p-0 text-[13px] text-[var(--lp-color-text-main)]">
            <li>1. Send your custom jacket request.</li>
            <li>2. We review sizing, fit direction, and references.</li>
            <li>3. We send curated jacket, print, and patch options.</li>
            <li>4. Final custom direction is confirmed manually.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/products"
              className="lp-focus-ring lp-log border border-[var(--lp-color-border-default)] px-3 py-2 text-[10px] hover:border-[var(--lp-color-border-accent)]"
            >
              RETURN TO STORE
            </Link>
            <Link
              href="/contact"
              className="lp-focus-ring lp-log border border-[var(--lp-color-border-accent)] bg-[rgba(141,2,2,0.22)] px-3 py-2 text-[10px] text-[var(--lp-color-text-strong)]"
            >
              CONTACT FALLBACK
            </Link>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitleBar title="BESPOKE INQUIRY FORM" meta="CUSTOM JACKETS INTAKE" />
        <div className="p-[10px]">
          <CustomJacketInquiryForm />
        </div>
      </Panel>

      <Panel>
        <PanelTitleBar title="PAST CUSTOM GALLERY" meta={`SEEDED: ${CUSTOM_JACKETS_GALLERY.length} ITEMS`} />
        <div className="grid gap-2 p-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {CUSTOM_JACKETS_GALLERY.map((item) => (
            <article key={item.id} className="overflow-hidden border border-[var(--lp-color-border-default)] bg-[rgba(0,0,0,0.25)]">
              <div className="relative h-[220px] w-full border-b border-[var(--lp-color-border-subtle)] bg-[var(--lp-color-bg-1)]">
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="space-y-1 p-2">
                <p className="font-lp-ui m-0 text-[14px] uppercase leading-[1.12] text-[var(--lp-color-text-strong)]">{item.title}</p>
                <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">{item.meta ?? 'PLACEHOLDER / READY FOR CLIENT SWAP'}</p>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="grid gap-3">
        <Panel>
          <PanelTitleBar title="PROCESS PANEL" meta="MANUAL CURATION WORKFLOW" />
          <div className="space-y-2 p-[10px] text-[13px] leading-[1.5] text-[var(--lp-color-text-main)]">
            <p className="m-0">Step 1: Send your request with sizing, fit, references, and timeline.</p>
            <p className="m-0">Step 2: We review your direction and shortlist the best route.</p>
            <p className="m-0">Step 3: We send a curated selection of jackets, prints, and patches.</p>
            <p className="m-0">Step 4: Final custom direction, quote, and build window are confirmed manually.</p>
            <p className="lp-log m-0 pt-2 text-[10px] text-[var(--lp-color-text-muted)]">
              This is not an instant configuration tool. Every final outcome is curated by the team after form submission.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel>
          <PanelTitleBar title="FAQ / EXPECTATIONS" meta="BEFORE YOU SUBMIT" />
          <div className="space-y-2 p-[10px] text-[13px] leading-[1.5] text-[var(--lp-color-text-main)]">
            <p className="m-0"><strong>Do I pick exact pieces from stock?</strong> No. We send curated options after we review your inquiry.</p>
            <p className="m-0"><strong>How long does follow-up take?</strong> Most inquiries receive a response within 24-72 hours.</p>
            <p className="m-0"><strong>Can I send references?</strong> Yes. Use links and notes in the form.</p>
          </div>
        </Panel>

        <Panel>
          <PanelTitleBar title="CONTACT FALLBACK" meta="DIRECT CHANNELS" />
          <div className="space-y-2 p-[10px]">
            <p className="lp-content-copy m-0 text-[13px] text-[var(--lp-color-text-main)]">
              If the form is unavailable, send your custom jacket request through Contact and include fit, references, and timeline.
            </p>
            <Link
              href="/contact"
              className="lp-focus-ring lp-log inline-flex min-h-[42px] items-center border border-[var(--lp-color-border-accent)] px-3 py-2 text-[10px] hover:border-[var(--lp-color-border-accent-bright)] hover:text-[var(--lp-color-primary-100)]"
            >
              OPEN CONTACT CHANNEL {'>'}
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}
