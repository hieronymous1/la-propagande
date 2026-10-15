import type { Metadata } from 'next';
import Image from 'next/image';
import { getLocationEntries } from '@/lib/queries/content';
import { MetaList, PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';

export const metadata: Metadata = {
  title: 'Locations',
  description: 'La Propagande showrooms in Badaro and Ashrafieh, Fearlove Vintage Shop in Beirut, and online platforms across Lebanon and Oman.',
};

export default async function LocationsPage() {
  const entries = await getLocationEntries();
  const showrooms = entries.filter((entry) => entry.kind === 'showroom');
  const sellingPoints = entries.filter((entry) => entry.kind === 'selling_point');

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="ACCESS.map" title="Find La Propagande" strip={`${showrooms.length} SHOWROOMS · ${sellingPoints.length} SELLING POINTS · 4 ONLINE PLATFORMS`} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3" aria-labelledby="showrooms">
          <h2 id="showrooms" className="lp-label m-0 text-[var(--lp-color-primary-400)]">
            Showrooms
          </h2>
          {showrooms.map((entry, index) => (
            <Panel key={entry.id} ticks reveal={index} className="overflow-hidden">
              <PanelTitleBar title={entry.title} meta="BY APPOINTMENT" />
              <div className="grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
                <div className="lp-media relative aspect-square">
                  <Image src={index % 2 === 0 ? '/images/brand/photo-showroom-rack.webp' : '/images/brand/photo-popup-rack.webp'} alt="" fill sizes="120px" className="object-cover" />
                </div>
                <div className="space-y-3">
                  <p className="lp-body m-0 whitespace-pre-line text-[var(--lp-color-text-strong)]">{entry.address}</p>
                  {entry.note ? <StatusChip label={entry.note} tone="accent" /> : null}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.address.replace(/\n/g, ', '))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-btn lp-btn--sm"
                  >
                    OPEN IN MAPS <span className="lp-btn__arrow">&gt;</span>
                  </a>
                </div>
              </div>
            </Panel>
          ))}
        </section>

        <section className="space-y-3" aria-labelledby="selling-points">
          <h2 id="selling-points" className="lp-label m-0 text-[var(--lp-color-primary-400)]">
            Selling points
          </h2>
          {sellingPoints.map((entry, index) => (
            <Panel key={entry.id} reveal={index + 2}>
              <PanelTitleBar title={entry.title} meta={entry.dateRange ? 'WINDOW' : 'ACTIVE'} />
              <div className="space-y-3 p-4">
                <p className="lp-body m-0 whitespace-pre-line text-[var(--lp-color-text-strong)]">{entry.address}</p>
                <MetaList
                  fields={[
                    ...(entry.dateRange ? [{ label: 'Window', value: entry.dateRange }] : []),
                    ...(entry.hours ? [{ label: 'Hours', value: entry.hours }] : []),
                    ...(entry.note ? [{ label: 'Note', value: entry.note }] : []),
                  ]}
                />
              </div>
            </Panel>
          ))}
        </section>
      </div>

      <section className="space-y-3" aria-labelledby="online-platforms">
        <h2 id="online-platforms" className="lp-label m-0 text-[var(--lp-color-primary-400)]">Online Platforms / Apps</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Doora app', region: 'Lebanon / MENA region' },
            { title: 'Sookit.co', region: undefined, href: 'https://sookit.co' },
            { title: 'BuyBuy lb', region: 'Lebanon' },
            { title: 'Xhawi', region: 'Oman' },
          ].map((platform, index) => (
            <Panel key={platform.title} reveal={index + 3}>
              <PanelTitleBar title={platform.title} />
              <div className="space-y-3 p-4">
                {platform.region ? <p className="lp-body m-0">{platform.region}</p> : null}
                {platform.href ? <a href={platform.href} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn--sm">VISIT PLATFORM <span className="lp-btn__arrow">&gt;</span></a> : null}
              </div>
            </Panel>
          ))}
        </div>
      </section>
    </div>
  );
}
