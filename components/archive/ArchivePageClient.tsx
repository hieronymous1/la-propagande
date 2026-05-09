'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ContributionForm from '@/components/archive/ContributionForm';
import { ARCHIVE_ENTRIES, ARCHIVE_FOLLOW_LINK } from '@/lib/site';
import type { ArchiveEntry } from '@/lib/site';
import { BadgeStrip, Panel, PanelTitleBar, StatusStrip } from '@/components/system/Primitives';

type ArchiveFolder = 'all' | 'fragments' | 'media' | 'logs' | 'links';

interface ArchivePageClientProps {
  initialEntries?: ArchiveEntry[];
}

export default function ArchivePageClient({ initialEntries = ARCHIVE_ENTRIES }: ArchivePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessChecked, setAccessChecked] = useState(false);
  const [folder, setFolder] = useState<ArchiveFolder>('all');
  const [delayedVisible, setDelayedVisible] = useState(false);
  const [permissionAlert, setPermissionAlert] = useState<string | null>(null);
  const [showSubIndex, setShowSubIndex] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [repaired, setRepaired] = useState(false);
  const [command, setCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState<string | null>(null);

  useEffect(() => {
    const isTerminalEntry = searchParams.get('entry') === 'terminal';
    const hasToken = typeof window !== 'undefined' && window.sessionStorage.getItem('lp_archive_access') === 'granted';

    if (isTerminalEntry || hasToken) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('lp_archive_access', 'granted');
      }
      setAccessChecked(true);
      if (isTerminalEntry) {
        router.replace('/archive', { scroll: false });
      }
      return;
    }

    router.replace('/', { scroll: false });
  }, [router, searchParams]);

  const visibleEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      if (folder !== 'all' && entry.folder !== folder) return false;
      return true;
    });
  }, [folder, initialEntries]);

  if (!accessChecked) {
    return null;
  }

  function runArchiveCommand() {
    const normalized = command.trim().toLowerCase();
    if (!normalized) return;
    if (normalized === 'help') {
      setCommandOutput('HIDDEN PATH: /archive/logs/deep-index // use STATUS label trigger');
      return;
    }
    if (normalized === 'dir') {
      setCommandOutput('DIR LIST: /archive/fragments /archive/media /archive/logs /archive/links');
      return;
    }
    setCommandOutput(`UNKNOWN COMMAND: ${normalized}`);
  }

  return (
    <div className="lp-shell space-y-3 py-4">
      <StatusStrip>PATH: /archive / STATUS: DEGRADED / FILES RESTORED: 24% / ACCESS: LIMITED</StatusStrip>

      <Panel>
        <PanelTitleBar title="ARCHIVE.sys" meta="HIDDEN FILE SYSTEM" />
        <div className="space-y-3 p-[10px]">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <StatusStrip>/archive/fragments</StatusStrip>
            <StatusStrip>/archive/media</StatusStrip>
            <StatusStrip>/archive/logs</StatusStrip>
            <StatusStrip>/archive/links</StatusStrip>
          </div>

          <div className="flex flex-wrap gap-1">
            {(['all', 'fragments', 'media', 'logs', 'links'] as ArchiveFolder[]).map((value) => (
              <button
                key={value}
                onClick={() => {
                  if (value === 'logs') {
                    setPermissionAlert('PERMISSION WARNING: LOGS BRANCH PARTIALLY RESTRICTED');
                  }
                  setFolder(value);
                }}
                className={`lp-focus-ring lp-log border px-2 py-1 text-[10px] ${
                  folder === value
                    ? 'border-[var(--lp-color-border-accent-bright)] text-[var(--lp-color-primary-100)]'
                    : 'border-[var(--lp-color-border-default)] hover:border-[var(--lp-color-border-accent)]'
                }`}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex h-[34px] items-center border border-[var(--lp-color-border-default)] bg-[var(--lp-color-bg-1)]">
            <span className="lp-log px-2 text-[10px] text-[var(--lp-color-primary-100)]">ARCHIVE://</span>
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder="type help or dir"
              className="h-full w-full bg-transparent px-1 text-[11px] uppercase tracking-[0.06em] text-[var(--lp-color-text-main)] placeholder:text-[var(--lp-color-text-dim)] focus:outline-none"
              aria-label="Archive command input"
            />
            <button onClick={runArchiveCommand} className="lp-exec-hit h-full border-l border-[var(--lp-color-border-default)] px-3 lp-log text-[10px] hover:text-[var(--lp-color-primary-100)]">
              RUN
            </button>
          </div>
          {commandOutput ? <p className="lp-command-output lp-log m-0 text-[10px] text-[var(--lp-color-primary-100)]">{commandOutput}</p> : null}
          {permissionAlert ? <p className="lp-warning-box lp-log m-0 text-[10px]">{permissionAlert}</p> : null}

          <BadgeStrip items={['NODE: BEIRUT', 'SIGNAL: UNSTABLE', 'LEAKED INDEX', 'ARCHIVE MODE: RECOVERY']} />

          <div className="lp-archive-grid">
            {visibleEntries.map((entry) => {
              const isBrokenValidLink = entry.behavior === 'broken-valid-link';
              const isRepairable = entry.behavior === 'repairable';

              const card = (
                <Panel className="overflow-hidden transition-colors hover:border-[var(--lp-color-border-accent)]">
                  <PanelTitleBar title={entry.title.toUpperCase()} meta={`${entry.type} / ${entry.folder.toUpperCase()}`} />
                  <div className="space-y-2 p-[10px]">
                    <div className="relative h-[130px] overflow-hidden border border-[var(--lp-color-border-subtle)]">
                      <Image src={entry.thumbnail} alt={entry.title} fill sizes="320px" className="object-cover" />
                      {isBrokenValidLink ? <div className="absolute inset-0 bg-[rgba(120,0,0,0.25)] mix-blend-multiply" /> : null}
                      {isRepairable && !repaired ? (
                        <button onClick={() => setRepaired(true)} className="absolute inset-0 lp-log text-[10px] text-[var(--lp-color-primary-100)] backdrop-blur-[1px]">
                          CORRUPTION DETECTED {'>'} CLICK TO REPAIR
                        </button>
                      ) : null}
                    </div>

                    <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">TYPE: {entry.type}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (entry.behavior === 'sub-index') setShowSubIndex((current) => !current);
                        if (entry.behavior === 'locked-teaser') setShowTeaser(true);
                        if (entry.behavior === 'permission') setPermissionAlert('ACCESS DENIED: ARCHIVE LOG CHECKSUM BRANCH REQUIRES OPERATOR KEY');
                      }}
                      className={`lp-exec-hit lp-log inline-flex border px-2 py-1 text-[10px] ${
                        entry.status === 'LOCKED'
                          ? 'border-[#6B2A2A] text-[#6B2A2A]'
                          : entry.status === 'DEGRADED' || entry.status === 'CORRUPTED'
                            ? 'border-[var(--lp-color-status-warning)] text-[var(--lp-color-status-warning)]'
                            : 'border-[var(--lp-color-border-default)] text-[var(--lp-color-text-muted)]'
                      }`}
                    >
                      STATUS: {entry.status}
                    </button>
                    <p className="m-0 text-[13px] leading-[1.4] text-[var(--lp-color-text-main)]">{entry.summary}</p>
                    {!entry.href ? <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-dim)]">LINK STATE: DEAD / LOCAL PREVIEW ONLY</p> : null}
                  </div>
                </Panel>
              );

              if (entry.behavior === 'delayed') {
                if (!delayedVisible) {
                  return (
                    <div
                      key={entry.id}
                      onMouseEnter={() => {
                        window.setTimeout(() => setDelayedVisible(true), 700);
                      }}
                    >
                      <Panel className="overflow-hidden border-[var(--lp-color-border-subtle)]">
                        <PanelTitleBar title="SCANNING..." meta="HOVER TO RESTORE FILE" />
                        <div className="p-[10px]">
                          <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">CORRUPTED ENTRY HIDDEN DURING INITIAL PASS.</p>
                        </div>
                      </Panel>
                    </div>
                  );
                }
                return (
                  <div
                    key={entry.id}
                    onMouseEnter={() => {
                      window.setTimeout(() => setDelayedVisible(true), 700);
                    }}
                  >
                    {card}
                  </div>
                );
              }

              if (entry.href) {
                const external = entry.href.startsWith('http');
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

              return <div key={entry.id}>{card}</div>;
            })}
          </div>

          {showSubIndex ? (
            <Panel className="border-[var(--lp-color-border-accent)]">
              <PanelTitleBar title="SUB INDEX // LOGS" meta="REVEALED" />
              <div className="space-y-1 p-[10px]">
                <p className="lp-log m-0 text-[10px]">/archive/logs/deep-index</p>
                <p className="lp-log m-0 text-[10px]">/archive/logs/relay-cache</p>
                <p className="lp-log m-0 text-[10px]">/archive/logs/operator-reports</p>
              </div>
            </Panel>
          ) : null}
        </div>
      </Panel>

      <Panel>
        <PanelTitleBar title="CONTRIBUTIONS.in" meta="TRANSMIT FRAGMENT" />
        <div className="space-y-3 p-[10px]">
          <a
            href={ARCHIVE_FOLLOW_LINK.href}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-focus-ring inline-flex border border-[var(--lp-color-border-default)] px-2 py-2 lp-log text-[10px] hover:border-[var(--lp-color-border-accent)]"
          >
            {'>'} {ARCHIVE_FOLLOW_LINK.label}
          </a>
          <ContributionForm />
        </div>
      </Panel>

      {showTeaser ? (
        <div className="fixed inset-0 z-[var(--lp-z-overlay)] flex items-center justify-center bg-[rgba(0,0,0,0.84)] p-3" onClick={() => setShowTeaser(false)}>
          <div onClick={(event) => event.stopPropagation()}>
            <Panel className="w-full max-w-[460px] border-[var(--lp-color-border-accent)]">
              <PanelTitleBar title="LOCKED FILE" meta="TEASER ACCESS" />
              <div className="space-y-2 p-[10px]">
                <p className="lp-log m-0 text-[10px] text-[var(--lp-color-status-warning)]">PERMISSION LEVEL TOO LOW</p>
                <p className="m-0 text-[13px] leading-[1.4] text-[var(--lp-color-text-main)]">This file is locked pending restoration. A preview index will appear in next recovery cycle.</p>
                <button onClick={() => setShowTeaser(false)} className="lp-focus-ring lp-log border border-[var(--lp-color-border-default)] px-2 py-1 text-[10px] hover:border-[var(--lp-color-border-accent)]">
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
