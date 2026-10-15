import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CustomJacketInquiryForm from '@/components/custom/CustomJacketInquiryForm';
import { PageHeader, Panel, PanelTitleBar } from '@/components/system/Primitives';
import { CUSTOM_JACKETS_GALLERY } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Custom Jackets',
  description: 'One-off and small-run custom jackets: vintage military shells, prints, embroideries and patches curated by hand. Submit a request to start a build.',
};

const STEPS = [
  { code: '01', title: 'Send your direction', body: 'Size, fit, base colour, the prints and patches you want. References welcome.' },
  { code: '02', title: 'We review the brief', body: 'Sizing, fit direction and references are checked against what is on the rack.' },
  { code: '03', title: 'Curated options', body: 'You receive a shortlist of available shells, prints, embroideries and patches.' },
  { code: '04', title: 'Build confirmed', body: 'Final direction is confirmed by hand before anything is cut or sewn.' },
];

export default function CustomJacketsPage() {
  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="CUSTOM.build" title="Custom Jackets" strip="BESPOKE TRACK · REQUEST LINE OPEN · CURATED BY HAND">
        <Link href="/products?c=custom-jackets" className="lp-btn">
          READY-MADE JACKETS <span className="lp-btn__arrow">&gt;</span>
        </Link>
      </PageHeader>
      <Image src="/images/client/born-from-revolt.webp" alt="Born from revolt, raised in war. La Propagande custom jacket artwork." width={1995} height={1200} sizes="(max-width: 768px) 100vw, 960px" className="mx-auto h-auto w-full max-w-[960px]" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel ticks reveal={0} className="overflow-hidden">
          <div className="lp-media relative aspect-[4/3] border-0 border-b border-[var(--lp-color-border-subtle)]">
            <Image src="/images/brand/photo-jacket-rack.webp" alt="Rack of custom military jackets with patches at the showroom" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
            <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.92))] p-4 md:p-6">
              <p className="lp-title lp-title-lg m-0 text-[var(--lp-color-text-strong)]">Vintage shells. Your prints. One build.</p>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <p className="lp-body m-0">
              Each custom jacket starts from a surplus or vintage military shell — flecktarn, woodland, M65, denim — and is reworked with La Propagande prints, embroideries and patches. Nothing is mass-produced; every request is read and answered by a person.
            </p>
          </div>
        </Panel>

        <Panel reveal={1}>
          <PanelTitleBar title="PROCESS" meta="4 STEPS" />
          <ol className="m-0 list-none p-0">
            {STEPS.map((step) => (
              <li key={step.code} className="grid grid-cols-[56px_1fr] gap-3 border-b border-[var(--lp-color-border-subtle)] p-4 last:border-b-0">
                <span className="lp-display text-[32px] leading-none text-[var(--lp-color-primary-400)]">{step.code}</span>
                <div>
                  <p className="lp-label m-0 text-[var(--lp-color-text-strong)]">{step.title}</p>
                  <p className="lp-body lp-body-sm m-0 mt-1 text-[var(--lp-color-text-muted)]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel ticks reveal={2} id="request">
        <PanelTitleBar title="REQUEST FORM" meta="CUSTOM INTAKE" />
        <div className="p-4 md:p-6">
          <CustomJacketInquiryForm />
        </div>
      </Panel>

      <Panel reveal={3}>
        <PanelTitleBar title="PAST BUILDS" meta={`${CUSTOM_JACKETS_GALLERY.length} RECORDS`} />
        <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3">
          {CUSTOM_JACKETS_GALLERY.map((item) => (
            <figure key={item.id} className="lp-media lp-media--zoom relative m-0 aspect-[4/5]">
              <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(5,5,5,0.9))] p-3">
                <span className="lp-label block text-[var(--lp-color-text-strong)]">{item.title}</span>
                {item.meta ? <span className="lp-log block">{item.meta}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </Panel>
    </div>
  );
}
