import Link from 'next/link';
import SocialLinks from '@/components/contact/SocialLinks';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default function ContactPage() {
  return (
    <div className="lp-shell space-y-3 py-4 md:py-5">
      <StatusStrip>MODULE: CONTACT.net / CHANNELS: OPEN / RESPONSE WINDOW: 24-72H</StatusStrip>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <PanelTitleBar title="CONNECT" meta="DIRECT RESPONSE" />
          <div className="space-y-2 p-3">
            <p className="font-lp-ui m-0 text-[22px] uppercase leading-[1.1] text-[var(--lp-color-text-strong)] md:text-[24px]">CONNECT</p>
            <p className="lp-content-copy m-0 text-[14px] text-[var(--lp-color-text-main)]">
              Use this channel for drop questions, custom order requests, event coordination, and physical access info. We reply directly with the fastest route available.
            </p>
            <p className="lp-log m-0 max-w-[56ch] text-[10px] text-[var(--lp-color-text-main)]">SEND A MESSAGE / EXPECT A REPLY WITHIN 24-72H</p>
          </div>
        </Panel>

        <Panel>
          <PanelTitleBar title="DIRECT CHANNELS" meta="OPEN" />
          <div className="space-y-3 p-3">
            <p className="lp-log m-0 max-w-[56ch] text-[10px] text-[var(--lp-color-text-main)]">WHATSAPP, INSTAGRAM, TIKTOK, AND COMMUNITY LIVE IN ONE DIRECT CHANNEL CLUSTER.</p>
            <SocialLinks />
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelTitleBar title="ACCESS POINTS" meta="SHOWROOMS / SELLING POINTS" />
        <div className="space-y-3 p-3">
          <p className="lp-content-copy m-0 text-[14px] text-[var(--lp-color-text-main)]">
            Need a showroom appointment or the current selling-point map? Open the locations dossier for addresses, access notes, and temporary activation windows.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/locations"
              className="lp-focus-ring lp-log inline-flex min-h-[44px] items-center border border-[var(--lp-color-border-accent)] px-3 py-2 text-[10px] text-[var(--lp-color-primary-100)] hover:border-[var(--lp-color-border-accent-bright)]"
            >
              {'>'} VIEW LOCATIONS
            </Link>
            <Link
              href="https://wa.me/message/HOUXU27KJCWAA1"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-focus-ring lp-log inline-flex min-h-[44px] items-center border border-[var(--lp-color-border-default)] px-3 py-2 text-[10px] hover:border-[var(--lp-color-border-accent)] hover:text-[var(--lp-color-primary-100)]"
            >
              {'>'} WHATSAPP
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
