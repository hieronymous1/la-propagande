'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandText,
  ExternalNodeStrip,
  LogStream,
  Panel,
  PanelTitleBar,
  StatusStrip,
} from '@/components/system/Primitives';

const BOOT_LINES = [
  'INITIALIZING LP.NODE',
  'AUTH CHECK COMPLETE',
  'SYSTEM INDEX PARTIAL',
  'EXTERNAL SIGNAL LOCKED',
  'PRESS ANY KEY TO SKIP',
] as const;

const PRIMARY_COMMANDS = [
  { label: 'ENTER STORE', route: '/store', exec: 'STORE.exe' },
  { label: 'VIEW EVENTS', route: '/events', exec: 'EVENTS.log' },
  { label: 'ABOUT', route: '/about', exec: 'ABOUT.sys' },
  { label: 'CONNECT', route: '/contact', exec: 'CONNECT.net' },
] as const;

const LOG_LINES = [
  '[SYS] ROUTE TABLE LOADED',
  '[SYS] SIGNAL INTEGRITY 97.7%',
  '[OPS] TRANSMISSION QUEUE READY',
  '[OPS] RECOVERY QUEUE 24%',
  '[USR] ACTIVE SESSIONS 024',
  '[NET] REGION PARIS <-> BEIRUT',
];

const NODE_STRIP = ['NODE-17 PARIS', 'NODE-03 BEIRUT', 'MIRROR WEST-2', 'GATEWAY LP_EXT'];

export default function LandingOS() {
  const router = useRouter();
  const [bootIndex, setBootIndex] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [execText, setExecText] = useState<string | null>(null);
  const [uptimeSeconds, setUptimeSeconds] = useState(18 * 3600 + 42 * 60 + 11);

  useEffect(() => {
    if (bootDone) return;
    const timer = window.setInterval(() => {
      setBootIndex((current) => {
        const next = current + 1;
        if (next >= BOOT_LINES.length) {
          window.clearInterval(timer);
          window.setTimeout(() => setBootDone(true), 220);
          return current;
        }
        return next;
      });
    }, 140);

    return () => window.clearInterval(timer);
  }, [bootDone]);

  useEffect(() => {
    const skip = () => setBootDone(true);
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, []);

  useEffect(() => {
    const ticker = window.setInterval(() => setUptimeSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  const visibleBootLines = useMemo(() => BOOT_LINES.slice(0, Math.min(BOOT_LINES.length, bootIndex + 1)), [bootIndex]);

  function execute(route: string, execName: string) {
    setExecText(`EXECUTING ${execName} ...`);
    window.setTimeout(() => router.push(route), 240);
  }

  function toClock(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <video
        src="https://framerusercontent.com/assets/QAOsJgTTaYmVBecxV6W62Y8uBI.mp4"
        className="absolute inset-0 z-[var(--lp-z-video)] h-full w-full object-cover saturate-[0.92] brightness-[0.62] contrast-[1.12]"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 z-[var(--lp-z-video)] bg-[radial-gradient(circle_at_10%_5%,rgba(179,18,18,0.18),rgba(0,0,0,0.78)_58%)]" />
      <div className="lp-noise lp-scanlines lp-vignette absolute inset-0 z-[var(--lp-z-noise)]" aria-hidden="true" />

      <main className="relative z-[var(--lp-z-panel)] px-3 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4">
        <div className="lp-shell grid gap-3 xl:grid-cols-[1.55fr_1fr]">
          <Panel className="bg-[rgba(0,0,0,0.7)]">
            <PanelTitleBar title="ROOT.CONSOLE" meta="SESSION: GUEST-LOCAL" />
            <div className="grid gap-3 p-[10px]">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Image src="/images/lp-logo-red.png" alt="La Propagande" width={60} height={60} priority className="h-[52px] w-[52px] object-contain" />
                  <p className="font-lp-ui m-0 text-[clamp(24px,5vw,40px)] uppercase leading-[1.02] text-[var(--lp-color-text-strong)]">LA PROPAGANDE</p>
                  <p className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">PARIS {'<->'} BEIRUT</p>
                </div>

                <div className="lp-command-grid">
                  {PRIMARY_COMMANDS.map((command) => (
                    <button key={command.label} onClick={() => execute(command.route, command.exec)} className="lp-focus-ring lp-exec-hit inline-flex text-left">
                      <CommandText label={command.label} />
                    </button>
                  ))}
                </div>

                {execText ? <p className="lp-command-output lp-log mt-2 mb-0 text-[10px] text-[var(--lp-color-primary-100)]">{execText}</p> : null}
              </div>
            </div>
          </Panel>

          <div className="grid content-start gap-3">
            <Panel className="hidden md:block">
              <PanelTitleBar title="SYSTEM LOG STREAM" meta="LIVE / DESKTOP" />
              <LogStream lines={LOG_LINES} className="p-[10px]" />
            </Panel>

            <Panel className="hidden lg:block">
              <PanelTitleBar title="EXTERNAL NODES" meta="ACTIVE" />
              <div className="p-[10px]">
                <ExternalNodeStrip nodes={NODE_STRIP} />
              </div>
            </Panel>
          </div>
        </div>

        <div className="lp-shell mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <StatusStrip>VISITOR COUNT: 00291</StatusStrip>
          <StatusStrip className="hidden md:flex">ROUTE STATUS: STORE | EVENTS | ABOUT | CONNECT</StatusStrip>
          <StatusStrip className="hidden xl:flex">RUNTIME: {toClock(uptimeSeconds)}</StatusStrip>
        </div>
      </main>

      {!bootDone ? (
        <div className="absolute inset-0 z-[var(--lp-z-boot)] flex items-center justify-center bg-[rgba(0,0,0,0.92)] px-3" role="status" aria-live="polite">
          <Panel className="w-full max-w-[620px] border-[var(--lp-color-border-accent)]">
            <PanelTitleBar title="BOOT.SEQ" meta="PRESS ANY KEY TO SKIP" />
            <div className="space-y-1 p-[10px]">
              {visibleBootLines.map((line, index) => (
                <p key={line} className={`lp-log m-0 text-[10px] ${index === visibleBootLines.length - 1 ? 'text-[var(--lp-color-primary-200)]' : ''}`}>
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
