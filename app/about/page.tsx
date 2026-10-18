import type { Metadata } from 'next';
import Image from 'next/image';
import { getAboutSections, splitAboutContent } from '@/lib/queries/content';
import { PageHeader, Panel, PanelTitleBar } from '@/components/system/Primitives';

export const metadata: Metadata = {
  title: 'About',
  description: 'La Propagande — born from revolt and war, based between Paris and Beirut. Background, vision, mission and purpose.',
};

export default async function AboutPage() {
  const { sections } = splitAboutContent(await getAboutSections());

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="ABOUT.sys" title="Background" strip="PUBLIC BRIEF · PARIS ↔ BEIRUT · BORN FROM REVOLT AND WAR" />

      <Panel reveal={1} className="overflow-hidden">
        <Image
          src="/images/client/manifesto.webp"
          alt="La Propagande manifesto: For the dreamers of yesterday. For the visionaries of tomorrow. For those who dare to do different. For the misfits who turn chaos into beauty. For the rockstars born in the wrong century. For the rebel minds, defiant and untamed. Welcome to the revolution."
          width={1200}
          height={1821}
          sizes="(max-width: 768px) 100vw, 640px"
          className="mx-auto h-auto w-full max-w-[640px]"
        />
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section, index) => (
          <Panel key={section.id ?? section.label} reveal={index + 1} className="flex flex-col">
            <PanelTitleBar title={section.label} meta={`0${index + 1}`} />
            <div className="flex-1 p-4">
              <p className="lp-body m-0 whitespace-pre-line">{section.body}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
