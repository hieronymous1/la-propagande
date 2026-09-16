import type { Metadata } from 'next';
import Image from 'next/image';
import { getAboutSections } from '@/lib/queries/content';
import { PageHeader, Panel, PanelTitleBar } from '@/components/system/Primitives';

export const metadata: Metadata = {
  title: 'About',
  description: 'La Propagande — born from revolt and war, based between Paris and Beirut. Background, vision, mission and purpose.',
};

const ART = ['/images/brand/slogan-old-world.webp', '/images/brand/slogan-new-world.webp', '/images/brand/slogan-not-televised.webp', '/images/brand/slogan-lied-to.webp'];

export default async function AboutPage() {
  const sections = await getAboutSections();

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="ABOUT.sys" title="Background" strip="PUBLIC BRIEF · PARIS ↔ BEIRUT · BORN FROM REVOLT AND WAR" />

      <Panel ticks reveal={0} className="overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="lp-media relative aspect-[4/3] border-0 border-b border-[var(--lp-color-border-subtle)] md:aspect-auto md:border-b-0 md:border-r">
            <Image src="/images/brand/photo-street-sign.webp" alt="La Propagande sigil on a street sign in Beirut" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
          </div>
          <div className="flex flex-col justify-center gap-4 p-4 md:p-8">
            <p className="lp-display lp-display-lg m-0 text-[var(--lp-color-text-strong)]">The old world is dying and the new struggles to be born.</p>
            <p className="lp-body m-0 text-[var(--lp-color-text-muted)]">A label, an archive and a network of nodes. Clothes as leaflets; events as broadcasts; the shop as a terminal into a hidden cultural record.</p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section, index) => (
          <Panel key={section.id ?? section.label} reveal={index + 1} className="flex flex-col">
            <PanelTitleBar title={section.label} meta={`0${index + 1}`} />
            <div className="flex-1 p-4">
              <p className="lp-body m-0">{section.body}</p>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {ART.map((src, index) => (
          <div key={src} className="lp-media lp-media--zoom lp-reveal relative aspect-[1200/848]" style={{ ['--i' as string]: index + 4 }}>
            <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
