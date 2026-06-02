import { getLocationEntries } from '@/lib/queries/content';
import { Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

export default async function LocationsPage() {
  const entries = await getLocationEntries();
  const showrooms = entries.filter((entry) => entry.kind === 'showroom');
  const sellingPoints = entries.filter((entry) => entry.kind === 'selling_point');

  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>PHYSICAL ACCESS MAP / SHOWROOMS / SELLING POINTS / LIVE WINDOWS</StatusStrip>

      <Panel>
        <PanelTitleBar title="PHYSICAL LOCATIONS" meta="CURRENT ACCESS POINTS" />
        <div className="grid gap-3 p-3 lg:grid-cols-2">
          <section className="space-y-3">
            <p className="font-lp-ui m-0 text-[16px] uppercase text-[var(--lp-color-text-strong)]">Showrooms</p>
            {showrooms.map((entry) => (
              <div key={entry.id} className="space-y-2 border border-[var(--lp-color-border-subtle)] bg-[rgba(0,0,0,0.35)] p-3">
                <p className="font-lp-ui m-0 text-[15px] uppercase text-[var(--lp-color-text-strong)]">{entry.title}</p>
                <p className="m-0 whitespace-pre-line text-[13px] leading-[1.5] text-[var(--lp-color-text-main)]">{entry.address}</p>
                {entry.note ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">{entry.note.toUpperCase()}</p> : null}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <p className="font-lp-ui m-0 text-[16px] uppercase text-[var(--lp-color-text-strong)]">Selling Points</p>
            {sellingPoints.map((entry) => (
              <div key={entry.id} className="space-y-2 border border-[var(--lp-color-border-subtle)] bg-[rgba(0,0,0,0.35)] p-3">
                <p className="font-lp-ui m-0 text-[15px] uppercase text-[var(--lp-color-text-strong)]">{entry.title}</p>
                <p className="m-0 whitespace-pre-line text-[13px] leading-[1.5] text-[var(--lp-color-text-main)]">{entry.address}</p>
                {entry.dateRange ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">WINDOW: {entry.dateRange}</p> : null}
                {entry.hours ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-main)]">HOURS: {entry.hours}</p> : null}
                {entry.note ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-main)]">{entry.note}</p> : null}
              </div>
            ))}
          </section>
        </div>
      </Panel>
    </div>
  );
}
