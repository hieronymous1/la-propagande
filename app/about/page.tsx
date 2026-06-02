import { getAboutSections } from '@/lib/queries/content';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default async function AboutPage() {
  const sections = await getAboutSections();

  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>ABOUT LA PROPAGANDE / BACKGROUND MODULE / PUBLIC BRIEF</StatusStrip>

      <Panel>
        <PanelTitleBar title="ABOUT LA PROPAGANDE" meta="BACKGROUND / VISION / MISSION / PURPOSE" />
        <div className="grid gap-3 p-3 md:grid-cols-3">
          {sections.map((section) => (
            <div key={section.label} className="space-y-1 border border-[var(--lp-color-border-subtle)] bg-[rgba(0,0,0,0.35)] p-2">
              <p className="font-lp-ui m-0 text-[15px] uppercase leading-[1.2] text-[var(--lp-color-text-strong)]">{section.label}</p>
              <p className="lp-content-copy m-0 text-[13px] text-[var(--lp-color-text-main)]">{section.body}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
