'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ContributionForm from '@/components/archive/ContributionForm';
import { ARCHIVE_ENTRIES, ARCHIVE_FOLLOW_LINK } from '@/lib/site';
import type { ArchiveEntry } from '@/lib/site';
import { PageHeader, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';
import type { ChipTone } from '@/components/system/Primitives';

type ArchiveFolder = 'all' | 'fragments' | 'media' | 'logs' | 'links';

interface ArchivePageClientProps {
  initialEntries?: ArchiveEntry[];
}

const RECOVERY_FRAMES = [
  '/images/brand/frame-cbs-1970.jpg',
  '/images/brand/frame-zapruder.jpg',
  '/images/brand/frame-nam-01.jpg',
  '/images/brand/frame-tunisia-01.jpg',
  '/images/brand/frame-moon.jpg',
  '/images/brand/frame-nam-02.jpg',
  '/images/brand/frame-cctv.jpg',
  '/images/brand/frame-tunisia-02.jpg',
  '/images/brand/photo-street-sign.webp',
  '/images/brand/photo-popup-rack.webp',
  '/images/brand/photo-night-fire-2.webp',
  '/images/brand/sigil-square.webp',
  '/images/brand/photo-bags.webp',
  '/images/brand/photo-tee-beach.webp',
];

/** Entries seeded in Shopify still point at the old placeholder SVGs; route those to real archival frames. */
function resolveThumbnail(entry: ArchiveEntry, index: number): string {
  if (!entry.thumbnail || entry.thumbnail.includes('/placeholders/')) return RECOVERY_FRAMES[index % RECOVERY_FRAMES.length];
  return entry.thumbnail;
}

const FOLDERS: { id: ArchiveFolder; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'fragments', label: '/FRAGMENTS' },
  { id: 'media', label: '/MEDIA' },
  { id: 'logs', label: '/LOGS' },
  { id: 'links', label: '/LINKS' },
];

function statusTone(status: ArchiveEntry['status']): ChipTone {
  if (status === 'AVAILABLE') return 'success';
  if (status === 'LOCKED') return 'locked';
  if (status === 'MIRROR') return 'info';
  return 'warning';
}

export default function ArchivePageClient({ initialEntries = ARCHIVE_ENTRIES }: ArchivePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessChecked, setAccessChecked] = useState(false);
  const [denied, setDenied] = useState(false);
  const [folder, setFolder] = useState<ArchiveFolder>('all');
  const [restored, setRestored] = useState<Set<string>>(new Set());
  const [repaired, setRepaired] = useState<Set<string>>(new Set());
  const [alert, setAlert] = useState<string | null>(null);
  const [showSubIndex, setShowSubIndex] = useState(false);
  const [teaser, setTeaser] = useState<ArchiveEntry | null>(null);
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const isTerminalEntry = searchParams.get('entry') === 'terminal';
    const hasToken = window.sessionStorage.getItem('lp_archive_access') === 'granted';
    if (isTerminalEntry || hasToken) {
      window.sessionStorage.setItem('lp_archive_access', 'granted');
      setAccessChecked(true);
      if (isTerminalEntry) router.replace('/archive', { scroll: false });
      return;
    }
    // no token: say so, then fall back to root where the index panel lives
    setDenied(true);
    const id = window.setTimeout(() => router.replace('/', { scroll: false }), 2200);
    return () => window.clearTimeout(id);
  }, [router, searchParams]);

  // recovery scan ticks up towards 24%
  useEffect(() => {
    if (!accessChecked) return;
    let value = 0;
    const id = window.setInterval(() => {
      value += 1;
      setScan(value);
      if (value >= 24) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [accessChecked]);

  useEffect(() => {
    if (!alert) return;
    const id = window.setTimeout(() => setAlert(null), 4200);
    return () => window.clearTimeout(id);
  }, [alert]);

  const visibleEntries = useMemo(() => initialEntries.filter((entry) => folder === 'all' || entry.folder === folder), [folder, initialEntries]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const entry of initialEntries) map[entry.folder] = (map[entry.folder] ?? 0) + 1;
    return map;
  }, [initialEntries]);

  if (!accessChecked) {
    return (
      <div className="lp-shell lp-page-pad flex min-h-[60vh] items-center justify-center">
        <Panel ticks accent className="w-full max-w-[520px]">
          <PanelTitleBar title={denied ? 'ACCESS DENIED' : 'ARCHIVE.sys'} meta={denied ? 'TOKEN MISSING' : 'HANDSHAKE'} />
          <div className="space-y-3 p-4" role="status" aria-live="polite">
            <p className="lp-log m-0">&gt; CHECKING ACCESS TOKEN…</p>
            {denied ? (
              <>
                <p className="lp-log lp-command-output m-0 text-[var(--lp-color-primary-300)]">&gt; NO TOKEN ON THIS SESSION · ROUTING TO ROOT</p>
                <p className="lp-body lp-body-sm m-0 text-[var(--lp-color-text-muted)]">The archive opens from the index panel on the root console, or type <span className="text-[var(--lp-color-text-strong)]">archive</span> in the command line.</p>
              </>
            ) : null}
          </div>
        </Panel>
      </div>
    );
  }

  function runArchiveCommand() {
    const normalized = command.trim().toLowerCase();
    if (!normalized) return;
    let line: string;
    if (normalized === 'help') line = 'COMMANDS: DIR · LS · STATUS · REPAIR ALL · EXIT · HIDDEN PATH: /archive/logs/deep-index';
    else if (normalized === 'dir' || normalized === 'ls') line = `DIR: /fragments (${counts.fragments ?? 0}) /media (${counts.media ?? 0}) /logs (${counts.logs ?? 0}) /links (${counts.links ?? 0})`;
    else if (normalized === 'status') line = `RECOVERY ${scan}% · ${initialEntries.length} ENTRIES · ${initialEntries.filter((e) => e.status === 'LOCKED').length} LOCKED`;
    else if (normalized === 'repair all') {
      setRepaired(new Set(initialEntries.filter((e) => e.behavior === 'repairable').map((e) => e.id)));
      setRestored(new Set(initialEntries.filter((e) => e.behavior === 'delayed').map((e) => e.id)));
      line = 'REPAIR PASS COMPLETE · CORRUPTED SECTORS REWRITTEN';
    } else if (normalized === 'exit') {
      router.push('/');
      line = 'CLOSING SESSION…';
    } else if (normalized.startsWith('cd ')) {
      const target = normalized.slice(3).replace(/^\//, '').replace(/^archive\//, '') as ArchiveFolder;
      if (['fragments', 'media', 'logs', 'links'].includes(target)) {
        setFolder(target);
        line = `CHANGED DIRECTORY → /archive/${target}`;
      } else line = `NO SUCH DIRECTORY: ${normalized.slice(3)}`;
    } else line = `UNKNOWN COMMAND: ${normalized.toUpperCase()} · TYPE HELP`;
    setCommandOutput((current) => [...current.slice(-4), `> ${normalized}`, line]);
    setCommand('');
  }

  function handleEntryAction(entry: ArchiveEntry) {
    if (entry.behavior === 'sub-index') setShowSubIndex((current) => !current);
    if (entry.behavior === 'locked-teaser') setTeaser(entry);
    if (entry.behavior === 'permission') setAlert('ACCESS DENIED · LOG CHECKSUM BRANCH REQUIRES OPERATOR KEY');
    if (entry.behavior === 'broken-valid-link') setAlert('LINK STATE: DEAD · LOCAL PREVIEW ONLY');
  }

  return (
    <div className="lp-shell lp-page-pad space-y-4">
      <PageHeader module="ARCHIVE.sys" title="Evidence locker" strip={`PATH /archive · STATUS DEGRADED · FILES RESTORED ${String(scan).padStart(2, '0')}% · ACCESS LIMITED`}>
        <div className="w-full max-w-[420px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="lp-log">RECOVERY</span>
            <span className="lp-log lp-tabular text-[var(--lp-color-primary-300)]">{scan}%</span>
          </div>
          <div className="h-[8px] w-full border border-[var(--lp-color-border-default)]">
            <div className="h-full bg-[var(--lp-color-primary-500)] transition-[width] duration-100" style={{ width: `${scan}%` }} />
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-[calc(var(--lp-topbar-h)+12px)] lg:self-start">
          <Panel reveal={0}>
            <PanelTitleBar title="TREE" meta="/ARCHIVE" />
            <div className="p-2">
              {FOLDERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFolder(item.id);
                    if (item.id === 'logs') setAlert('PERMISSION WARNING · LOGS BRANCH PARTIALLY RESTRICTED');
                  }}
                  className="lp-toggle lp-toggle--row border-transparent px-2"
                  aria-pressed={folder === item.id}
                >
                  <span>
                    <span className="text-[var(--lp-color-primary-500)]">{folder === item.id ? '▸ ' : '  '}</span>
                    {item.label}
                  </span>
                  <span className="lp-tabular text-[var(--lp-color-text-dim)]">{item.id === 'all' ? initialEntries.length : counts[item.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel reveal={1}>
            <PanelTitleBar title="ARCHIVE://" meta="TERMINAL" />
            <div className="space-y-2 p-2">
              <form
                className="lp-field"
                onSubmit={(event) => {
                  event.preventDefault();
                  runArchiveCommand();
                }}
              >
                <span className="lp-field__prefix">&gt;</span>
                <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="help · dir · cd media" className="lp-field__input" aria-label="Archive command input" autoComplete="off" />
                <button type="submit" className="lp-field__action">
                  RUN
                </button>
              </form>
              {commandOutput.length > 0 ? (
                <div className="lp-log space-y-[2px] border-t border-[var(--lp-color-border-subtle)] pt-2">
                  {commandOutput.map((line, i) => (
                    <p key={`${line}-${i}`} className={`m-0 ${line.startsWith('>') ? 'text-[var(--lp-color-text-dim)]' : 'lp-command-output text-[var(--lp-color-primary-300)]'}`}>
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>

          <div className="flex flex-wrap gap-[6px]">
            {['NODE: BEIRUT', 'SIGNAL: UNSTABLE', 'LEAKED INDEX', 'MODE: RECOVERY'].map((item) => (
              <StatusChip key={item} label={item} />
            ))}
          </div>
        </aside>

        <section className="space-y-3" aria-label="Archive entries">
          {alert ? (
            <p className="lp-warning-box lp-log lp-command-output m-0" role="alert">
              {alert}
            </p>
          ) : null}

          <div className="lp-archive-grid">
            {visibleEntries.map((entry, index) => {
              const isDelayed = entry.behavior === 'delayed' && !restored.has(entry.id);
              const isRepairable = entry.behavior === 'repairable' && !repaired.has(entry.id);
              const isLocked = entry.status === 'LOCKED';
              const external = entry.href?.startsWith('http');

              const media = (
                <div className={`lp-media lp-media--scan relative aspect-[16/10] border-0 border-b border-[var(--lp-color-border-subtle)] ${isLocked || isDelayed ? 'lp-media--degraded' : ''} ${entry.behavior === 'broken-valid-link' ? 'lp-media--red' : ''}`}>
                  <Image src={resolveThumbnail(entry, initialEntries.indexOf(entry))} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className={`object-cover ${isDelayed ? 'blur-[6px]' : ''} transition-[filter] duration-500`} />
                  {isRepairable ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setRepaired((current) => new Set(current).add(entry.id));
                      }}
                      className="lp-label absolute inset-0 flex items-center justify-center bg-[rgba(5,5,5,0.55)] text-[var(--lp-color-primary-300)] backdrop-blur-[2px] transition-colors hover:bg-[rgba(142,17,17,0.35)]"
                    >
                      CORRUPTION DETECTED · TAP TO REPAIR
                    </button>
                  ) : null}
                  {isDelayed ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        setRestored((current) => new Set(current).add(entry.id));
                      }}
                      onMouseEnter={() => window.setTimeout(() => setRestored((current) => new Set(current).add(entry.id)), 700)}
                      className="lp-label absolute inset-0 flex items-center justify-center bg-[rgba(5,5,5,0.5)] text-[var(--lp-color-text-strong)]"
                    >
                      SCANNING… TAP TO RESTORE
                    </button>
                  ) : null}
                  <span className="lp-chip absolute left-0 top-0 z-[2] border-l-0 border-t-0">{entry.type}</span>
                  <span className="lp-chip absolute right-0 top-0 z-[2] border-r-0 border-t-0" data-tone={statusTone(entry.status)}>
                    {entry.status}
                  </span>
                </div>
              );

              const body = (
                <div className="space-y-2 p-3">
                  <h3 className="lp-title lp-title-md m-0 text-[var(--lp-color-text-strong)]">{isDelayed ? 'UNINDEXED FILE' : entry.title}</h3>
                  <p className="lp-body lp-body-sm m-0 text-[var(--lp-color-text-muted)]">{isDelayed ? 'Hidden during the initial pass. Restore to read.' : entry.summary}</p>
                  <p className="lp-log m-0">
                    /archive/{entry.folder} · {entry.href ? (external ? 'EXTERNAL LINK' : 'INTERNAL PATH') : 'LOCAL PREVIEW'}
                  </p>
                </div>
              );

              const card = (
                <Panel interactive reveal={Math.min(index, 10)} as="article" className="h-full overflow-hidden">
                  {media}
                  {body}
                </Panel>
              );

              if (entry.href && entry.behavior !== 'broken-valid-link') {
                return external ? (
                  <a key={entry.id} href={entry.href} target="_blank" rel="noopener noreferrer" className="block lp-focus-ring">
                    {card}
                  </a>
                ) : (
                  <Link key={entry.id} href={entry.href} className="block lp-focus-ring">
                    {card}
                  </Link>
                );
              }

              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleEntryAction(entry)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleEntryAction(entry);
                    }
                  }}
                  className="block w-full cursor-pointer text-left lp-focus-ring"
                  aria-label={`${entry.title}, ${entry.status}`}
                >
                  {card}
                </div>
              );
            })}
          </div>

          {showSubIndex ? (
            <Panel accent className="lp-reveal">
              <PanelTitleBar title="SUB INDEX · /LOGS" meta="REVEALED" />
              <div className="space-y-1 p-3">
                {['/archive/logs/deep-index', '/archive/logs/relay-cache', '/archive/logs/operator-reports'].map((line) => (
                  <p key={line} className="lp-log m-0 text-[var(--lp-color-primary-300)]">
                    {line}
                  </p>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel reveal={4}>
            <PanelTitleBar title="CONTRIBUTIONS.in" meta="TRANSMIT A FRAGMENT" />
            <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
              <ContributionForm />
              <div className="space-y-3 md:border-l md:border-[var(--lp-color-border-subtle)] md:pl-4">
                <p className="lp-body lp-body-sm m-0 text-[var(--lp-color-text-muted)]">Found a fragment, a flyer, a photo from a pop-up? Send it in and it enters the recovery queue.</p>
                <a href={ARCHIVE_FOLLOW_LINK.href} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn--sm lp-btn--block">
                  {ARCHIVE_FOLLOW_LINK.label.toUpperCase()} <span className="lp-btn__arrow">&gt;</span>
                </a>
              </div>
            </div>
          </Panel>
        </section>
      </div>

      {teaser ? (
        <div className="fixed inset-0 z-[var(--lp-z-overlay)] flex items-center justify-center bg-[rgba(0,0,0,0.84)] p-3 backdrop-blur-[3px]" onClick={() => setTeaser(null)} role="presentation">
          <div onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Locked file">
            <Panel ticks accent className="lp-reveal w-full max-w-[460px]">
              <PanelTitleBar title="LOCKED FILE" meta={teaser.type} />
              <div className="space-y-3 p-4">
                <p className="lp-label m-0 text-[var(--lp-color-status-warning)]">PERMISSION LEVEL TOO LOW</p>
                <p className="lp-title lp-title-md m-0 text-[var(--lp-color-text-strong)]">{teaser.title}</p>
                <p className="lp-body lp-body-sm m-0">This file is locked pending restoration. A preview index will appear in the next recovery cycle.</p>
                <button onClick={() => setTeaser(null)} className="lp-btn lp-btn--sm">
                  CLOSE
                </button>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
