import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from '@/components/contact/SocialLinks';
import { PageHeader, Panel, PanelTitleBar } from '@/components/system/Primitives';

export const metadata: Metadata = {
  title: 'Contact us',
  description: 'Reach La Propagande on WhatsApp, Instagram or TikTok for drops, custom orders, events and showroom access in Paris and Beirut.',
};

export default function ContactPage() {
  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="CONTACT.net" title="Secure uplink" strip="CHANNELS OPEN · RESPONSE WINDOW 24–72H · PARIS ↔ BEIRUT" />
      <Image src="/images/client/connect-no-qr.webp" alt="Are you brainwashed yet? La Propagande — www.lapropagande.net, @_lapropagande and @lapropagande.psyops." width={994} height={1600} sizes="(max-width: 768px) 100vw, 640px" className="mx-auto h-auto w-full max-w-[640px]" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel ticks reveal={0}>
          <PanelTitleBar title="DIRECT CHANNELS" meta="FASTEST ROUTE" />
          <div className="space-y-5 p-4 md:p-6">
            <p className="lp-body lp-body-lg m-0 text-[var(--lp-color-text-strong)]">
              WhatsApp is the fastest line. Instagram and TikTok are open for everything else. We reply directly — no ticket system, no bots.
            </p>
            <SocialLinks />
          </div>
        </Panel>

        <Link href="/locations" className="group block lp-focus-ring">
          <Panel interactive reveal={1} className="h-full overflow-hidden">
            <PanelTitleBar title="ACCESS POINTS" meta="SHOWROOMS / SELLING POINTS" />
            <div className="flex items-end justify-between gap-4 p-4">
              <div>
                <p className="lp-title lp-title-lg m-0 text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">Physical locations</p>
                <p className="lp-body lp-body-sm m-0 mt-1 text-[var(--lp-color-text-muted)]">Addresses, hours, temporary activation windows.</p>
              </div>
              <span className="lp-btn lp-btn--sm">
                OPEN MAP <span className="lp-btn__arrow">&gt;</span>
              </span>
            </div>
          </Panel>
        </Link>
      </div>
    </div>
  );
}
