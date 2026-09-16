import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from '@/components/contact/SocialLinks';
import { PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';

export const metadata: Metadata = {
  title: 'Connect',
  description: 'Reach La Propagande on WhatsApp, Instagram or TikTok for drops, custom orders, events and showroom access in Paris and Beirut.',
};

const CHANNELS = [
  { label: 'Drops & orders', body: 'Sizing, restocks, shipping between Paris and Beirut.' },
  { label: 'Custom jackets', body: 'Start a build or follow up on an open request.' },
  { label: 'Events', body: 'Pop-ups, raves, collaborations, press.' },
  { label: 'Showrooms', body: 'Appointments in Badaro and Ashrafieh.' },
];

export default function ContactPage() {
  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="CONNECT.net" title="Secure uplink" strip="CHANNELS OPEN · RESPONSE WINDOW 24–72H · PARIS ↔ BEIRUT" />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel ticks reveal={0}>
          <PanelTitleBar title="DIRECT CHANNELS" meta="FASTEST ROUTE" />
          <div className="space-y-5 p-4 md:p-6">
            <p className="lp-body lp-body-lg m-0 text-[var(--lp-color-text-strong)]">
              WhatsApp is the fastest line. Instagram and TikTok are open for everything else. We reply directly — no ticket system, no bots.
            </p>
            <SocialLinks />
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
              {CHANNELS.map((channel) => (
                <li key={channel.label} className="border-t border-[var(--lp-color-border-subtle)] pt-3">
                  <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">{channel.label}</p>
                  <p className="lp-body lp-body-sm m-0 mt-1 text-[var(--lp-color-text-muted)]">{channel.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Link href="/locations" className="group block lp-focus-ring">
          <Panel interactive reveal={1} className="h-full overflow-hidden">
            <PanelTitleBar title="ACCESS POINTS" meta="SHOWROOMS / SELLING POINTS" />
            <div className="lp-media lp-media--zoom relative aspect-[16/10] border-0 border-b border-[var(--lp-color-border-subtle)]">
              <Image src="/images/brand/photo-showroom-rack.webp" alt="La Propagande showroom rack" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              <div className="absolute left-3 top-3 flex gap-2">
                <StatusChip label="BADARO" dot tone="success" />
                <StatusChip label="ASHRAFIEH" dot tone="success" />
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 p-4">
              <div>
                <p className="lp-display lp-display-md m-0 text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">Physical locations</p>
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
