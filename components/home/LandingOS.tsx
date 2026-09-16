'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePalette } from '@/components/system/CommandPalette';
import { CommandText, Panel, PanelTitleBar, StatusChip } from '@/components/system/Primitives';

interface FeaturedProduct {
  handle: string;
  title: string;
  image: string;
  price: string;
  code: string;
  status: string;
}

interface QueueItem {
  handle: string;
  title: string;
  date: string;
  channel: string;
  location: string;
  image: string | null;
}

interface LandingOSProps {
  featured: FeaturedProduct[];
  queue: QueueItem[];
  counts: { products: number; posts: number };
}

const BOOT_LINES = ['INITIALIZING LP.NODE', 'AUTH CHECK COMPLETE', 'MOUNTING /STORE /EVENTS /ARCHIVE', 'EXTERNAL SIGNAL LOCKED', 'READY'] as const;

const PRIMARY_COMMANDS = [
  { label: 'ENTER STORE', route: '/products', exec: 'STORE.exe', key: 'S' },
  { label: 'VIEW EVENTS', route: '/blog', exec: 'EVENTS.log', key: 'E' },
  { label: 'ABOUT', route: '/about', exec: 'ABOUT.sys', key: '' },
  { label: 'CONNECT', route: '/contact', exec: 'CONNECT.net', key: 'C' },
] as const;

const NODE_STRIP = ['NODE-17 PARIS', 'NODE-03 BEIRUT', 'MIRROR WEST-2', 'GATEWAY LP_EXT'];

const DIRECTORY = ['/root', '├─ /store', '│  ├─ /tops', '│  ├─ /bottoms', '│  ├─ /accessories', '│  └─ /custom-jackets', '├─ /events', '├─ /about', '├─ /locations', '├─ /connect', '└─ /archive  [restricted]'];

const SLOGANS = [
  '/images/brand/slogan-designed.webp',
  '/images/brand/slogan-marketed.webp',
  '/images/brand/slogan-manipulated.webp',
  '/images/brand/slogan-used-against-you.webp',
  '/images/brand/slogan-researched.webp',
  '/images/brand/slogan-packaged.webp',
  '/images/brand/slogan-movements-sold.webp',
  '/images/brand/slogan-lied-to.webp',
];

function toClock(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function shortDate(value: string) {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getFullYear()).slice(-2)}`;
}

export default function LandingOS({ featured, queue, counts }: LandingOSProps) {
  const router = useRouter();
  const { open: openPalette } = usePalette();
  const [bootIndex, setBootIndex] = useState(0);
  const [bootDone, setBootDone] = useState(true);
  const [execText, setExecText] = useState<string | null>(null);
  const [uptime, setUptime] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const logCursor = useRef(0);

  // boot once per session
  useEffect(() => {
    const seen = window.sessionStorage.getItem('lp_booted') === '1';
    if (seen) return;
    setBootDone(false);
    const timer = window.setInterval(() => {
      setBootIndex((current) => {
        const next = current + 1;
        if (next >= BOOT_LINES.length) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setBootDone(true);
            window.sessionStorage.setItem('lp_booted', '1');
          }, 260);
          return current;
        }
        return next;
      });
    }, 150);
    const skip = () => {
      window.clearInterval(timer);
      setBootDone(true);
      window.sessionStorage.setItem('lp_booted', '1');
    };
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, []);

  useEffect(() => {
    const started = Number(window.sessionStorage.getItem('lp_session_start') ?? Date.now());
    window.sessionStorage.setItem('lp_session_start', String(started));
    const tick = () => setUptime(Math.floor((Date.now() - started) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const logSource = useMemo(
    () => [
      '[SYS] ROUTE TABLE LOADED',
      `[STO] INVENTORY NODE ONLINE · ${String(counts.products).padStart(3, '0')} RECORDS`,
      `[EVT] TRANSMISSION QUEUE · ${String(counts.posts).padStart(3, '0')} ENTRIES`,
      '[NET] REGION PARIS <-> BEIRUT',
      '[ARC] RECOVERY 24% · ACCESS LIMITED',
      '[SYS] SIGNAL INTEGRITY 97.7%',
      '[USR] SESSION GUEST-LOCAL',
      '[OPS] MIRROR WEST-2 SYNCED',
      '[NET] GATEWAY LP_EXT HANDSHAKE OK',
      '[SYS] SCANLINE FILTER ENGAGED',
    ],
    [counts.posts, counts.products]
  );

  useEffect(() => {
    if (!bootDone) return;
    setLogLines(logSource.slice(0, 5));
    logCursor.current = 5;
    const id = window.setInterval(() => {
      const line = logSource[logCursor.current % logSource.length];
      logCursor.current += 1;
      setLogLines((current) => [...current.slice(-6), `${line}`]);
    }, 2600);
    return () => window.clearInterval(id);
  }, [bootDone, logSource]);

  const visibleBootLines = useMemo(() => BOOT_LINES.slice(0, Math.min(BOOT_LINES.length, bootIndex + 1)), [bootIndex]);

  function execute(route: string, execName: string) {
    setExecText(`EXECUTING ${execName} ...`);
    window.setTimeout(() => router.push(route), 220);
  }

  function openArchive() {
    window.sessionStorage.setItem('lp_archive_access', 'granted');
    setExecText('EXECUTING ARCHIVE.sys ... ACCESS LIMITED');
    window.setTimeout(() => router.push('/archive'), 260);
  }

  return (
    <div className="relative min-h-[calc(100vh-var(--lp-topbar-h))] w-full overflow-hidden bg-black">
      <video
        src="/media/home-loop.mp4"
        poster="/media/home-poster.jpg"
        className="absolute inset-0 z-[var(--lp-z-video)] h-full w-full object-cover opacity-[0.55] saturate-0 contrast-[1.15]"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[var(--lp-z-video)] bg-[radial-gradient(ellipse_at_15%_0%,rgba(179,18,18,0.32),rgba(0,0,0,0.82)_55%)]" />
      <div className="absolute inset-0 z-[var(--lp-z-video)] bg-[var(--lp-color-primary-800)] opacity-20 mix-blend-multiply" />
      <div className="lp-noise lp-scanlines lp-vignette absolute inset-0 z-[var(--lp-z-noise)]" aria-hidden="true" />

      <div className="relative z-[var(--lp-z-panel)] lp-page-pad">
        <div className="lp-shell grid gap-3 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[1.6fr_1fr]">
          {/* ROOT CONSOLE */}
          <Panel ticks reveal={0} className="bg-[rgba(5,5,5,0.78)]">
            <PanelTitleBar title="ROOT.CONSOLE" meta="SESSION: GUEST-LOCAL" />
            <div className="relative overflow-hidden p-4 md:p-6">
              <Image
                src="/images/brand/head.webp"
                alt=""
                width={600}
                height={424}
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-6 w-[320px] opacity-[0.2] mix-blend-screen saturate-0 [mask-image:radial-gradient(closest-side,#000_45%,transparent_100%)] md:w-[460px] md:opacity-[0.28]"
              />
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <Image
                    src="/images/lp-text-logo-cropped.png"
                    alt="La Propagande"
                    width={2732}
                    height={609}
                    priority
                    className="h-auto w-[min(100%,620px)] invert"
                    sizes="(max-width: 768px) calc(100vw - 64px), 620px"
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <h1 className="lp-label m-0 text-[var(--lp-color-text-strong)]">La Propagande</h1>
                    <p className="lp-log m-0">PARIS ↔ BEIRUT · BORN FROM REVOLT AND WAR</p>
                  </div>
                </div>

                <div className="lp-command-grid">
                  {PRIMARY_COMMANDS.map((command, i) => (
                    <button
                      key={command.label}
                      onClick={() => execute(command.route, command.exec)}
                      className="lp-focus-ring lp-reveal group inline-flex items-center gap-4 text-left"
                      style={{ ['--i' as string]: i + 2 }}
                    >
                      <CommandText label={command.label} />
                      {command.key ? (
                        <kbd className="lp-ui-sm hidden border border-[var(--lp-color-border-subtle)] px-[6px] py-[2px] text-[var(--lp-color-text-dim)] transition-colors group-hover:border-[var(--lp-color-primary-600)] group-hover:text-[var(--lp-color-primary-300)] md:inline-block">
                          {command.key}
                        </kbd>
                      ) : null}
                    </button>
                  ))}
                </div>

                <button type="button" onClick={() => openPalette()} className="lp-field lp-focus-ring w-full max-w-[560px] cursor-text text-left">
                  <span className="lp-field__prefix">ROOT://LP&gt;</span>
                  <span className="lp-ui-sm min-w-0 flex-1 truncate text-[var(--lp-color-text-dim)]">type a command · help · archive</span>
                  <span className="lp-command-cursor mr-3" aria-hidden />
                </button>

                <p className={`lp-log m-0 min-h-[18px] text-[var(--lp-color-primary-300)] ${execText ? 'lp-command-output' : ''}`} aria-live="polite">
                  {execText ?? ''}
                </p>
              </div>
            </div>
          </Panel>

          {/* RIGHT COLUMN */}
          <div className="grid content-start gap-3">
            <button type="button" onClick={openArchive} className="group text-left lp-focus-ring" aria-label="Open the archive — access limited">
              <Panel interactive accent reveal={1} className="overflow-hidden">
                <PanelTitleBar title="ARCHIVE INDEX" meta="STATUS: DEGRADED" />
                <div className="grid grid-cols-[96px_1fr] gap-3 p-3">
                  <span className="lp-media lp-media--degraded lp-media--scan relative block aspect-square">
                    <Image src="/images/brand/frame-nam-01.jpg" alt="" fill sizes="96px" className="object-cover" />
                  </span>
                  <div className="space-y-1">
                    <p className="lp-label-lg lp-label m-0 text-[var(--lp-color-text-strong)]">Files restored: 24%</p>
                    <div className="h-[6px] w-full border border-[var(--lp-color-border-default)]">
                      <div className="h-full w-[24%] bg-[var(--lp-color-primary-500)] transition-[width] duration-700 ease-lp group-hover:w-[31%]" />
                    </div>
                    <p className="lp-log m-0">ACCESS: LIMITED · 13 ENTRIES · 4 FOLDERS</p>
                    <p className="lp-ui-sm m-0 text-[var(--lp-color-primary-300)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      &gt; CLICK TO REQUEST ACCESS
                    </p>
                  </div>
                </div>
              </Panel>
            </button>

            <Panel reveal={2} className="hidden md:block">
              <PanelTitleBar title="SYSTEM LOG" meta="LIVE" />
              <div className="lp-log space-y-[3px] p-3" aria-live="off">
                {logLines.map((line, i) => (
                  <p key={`${line}-${i}`} className={`m-0 ${i === logLines.length - 1 ? 'lp-command-output text-[var(--lp-color-text-main)]' : ''}`}>
                    <span className="text-[var(--lp-color-text-dim)]">{toClock(Math.max(0, uptime - (logLines.length - 1 - i) * 3))} </span>
                    {line}
                  </p>
                ))}
              </div>
            </Panel>

            {queue.length > 0 ? (
              <Panel reveal={3}>
                <PanelTitleBar title="TRANSMISSION QUEUE" meta={`${queue.length} PENDING`} />
                <ul className="m-0 list-none p-0">
                  {queue.slice(0, 3).map((item) => (
                    <li key={item.handle} className="border-b border-[var(--lp-color-border-subtle)] last:border-b-0">
                      <Link href={`/blog/${item.handle}`} className="group flex min-h-[56px] items-center gap-3 px-3 py-2 transition-colors duration-150 hover:bg-[rgba(142,17,17,0.12)]">
                        <span className="lp-media relative block h-10 w-10 shrink-0">
                          {item.image ? <Image src={item.image} alt="" fill sizes="40px" className="object-cover" /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="lp-label block truncate text-[var(--lp-color-text-strong)]">{item.title}</span>
                          <span className="lp-log block truncate">
                            {shortDate(item.date)} · {item.channel}
                            {item.location ? ` · ${item.location}` : ''}
                          </span>
                        </span>
                        <span className="lp-ui-sm text-[var(--lp-color-primary-500)] transition-transform duration-200 group-hover:translate-x-1">&gt;</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            ) : null}
          </div>
        </div>

        {/* FEATURED DROP + DIRECTORY + NODES */}
        <div className="lp-shell mt-3 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
          {featured.length > 0 ? (
            <Panel reveal={4}>
              <PanelTitleBar title="FEATURED DROP" meta="STORE.exe" action={<Link href="/products" className="lp-ui-sm text-[var(--lp-color-primary-300)] hover:text-[var(--lp-color-text-strong)]">OPEN CATALOG &gt;</Link>} />
              <div className="grid grid-cols-3 gap-2 p-3">
                {featured.map((product) => (
                  <Link key={product.handle} href={`/products/${product.handle}`} className="group lp-focus-ring block min-w-0">
                    <span className="lp-media lp-media--zoom relative block aspect-[4/5]">
                      <Image src={product.image} alt={product.title} fill sizes="(max-width: 768px) 30vw, 220px" className="object-cover" />
                      <span className="lp-chip absolute left-1 top-1 hidden max-w-[calc(100%-8px)] md:inline-flex" data-tone={product.status === 'AVAILABLE' ? 'success' : 'warning'}>
                        {product.code}
                      </span>
                    </span>
                    <span className="mt-2 block">
                      <span className="lp-label block truncate text-[var(--lp-color-text-strong)] transition-colors group-hover:text-[var(--lp-color-primary-300)]">{product.title}</span>
                      <span className="lp-log block">{product.price}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Panel>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Panel reveal={5} className="hidden sm:block">
              <PanelTitleBar title="DIRECTORY" meta="/ROOT" />
              <div className="p-3">
                {DIRECTORY.map((line) => (
                  <p key={line} className="lp-log m-0 whitespace-pre text-[var(--lp-color-text-muted)]">
                    {line}
                  </p>
                ))}
              </div>
            </Panel>
            <Panel reveal={6}>
              <PanelTitleBar title="SESSION" meta={toClock(uptime)} />
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap gap-[6px]">
                  {NODE_STRIP.map((node) => (
                    <StatusChip key={node} label={node} dot tone={node.includes('BEIRUT') || node.includes('PARIS') ? 'success' : 'neutral'} />
                  ))}
                </div>
                <p className="lp-log m-0">USER: GUEST · REGION: PAR/BEY · SHORTCUTS: S E A C · ⌘K</p>
              </div>
            </Panel>
          </div>
        </div>

        {/* SLOGAN STRIP — the brand's own artwork */}
        <div className="lp-shell mt-3">
          <div className="lp-ticker lp-panel overflow-hidden" aria-hidden="true">
            <div className="lp-ticker__track" style={{ gap: 0, paddingRight: 0 }}>
              {[...SLOGANS, ...SLOGANS].map((src, i) => (
                <Image key={`${src}-${i}`} src={src} alt="" width={240} height={170} className="h-[72px] w-auto border-r border-[var(--lp-color-border-subtle)] md:h-[92px]" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {!bootDone ? (
        <div className="absolute inset-0 z-[var(--lp-z-boot)] flex items-center justify-center bg-[rgba(0,0,0,0.94)] px-3" role="status" aria-live="polite">
          <Panel ticks accent className="w-full max-w-[560px]">
            <PanelTitleBar title="BOOT.SEQ" meta="PRESS ANY KEY TO SKIP" />
            <div className="space-y-1 p-4">
              {visibleBootLines.map((line, index) => (
                <p key={line} className={`lp-log m-0 ${index === visibleBootLines.length - 1 ? 'text-[var(--lp-color-primary-300)]' : ''}`}>
                  <span className="text-[var(--lp-color-text-dim)]">{String(index + 1).padStart(2, '0')} </span>
                  {line}
                </p>
              ))}
            </div>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
