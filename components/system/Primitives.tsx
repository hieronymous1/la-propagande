import Link from 'next/link';
import type { ReactNode } from 'react';

interface SimpleClassName {
  className?: string;
}

interface ShellProps extends SimpleClassName {
  children: ReactNode;
  statusStrip?: ReactNode;
}

export function OSShell({ children, statusStrip, className = '' }: ShellProps) {
  return (
    <div className="lp-page">
      <div className={`lp-shell pb-4 ${className}`.trim()}>
        {children}
        {statusStrip ? <div className="mt-3">{statusStrip}</div> : null}
      </div>
    </div>
  );
}

interface SystemBarProps extends SimpleClassName {
  module: string;
  node?: string;
  status?: string;
  rightSlot?: ReactNode;
}

export function SystemBar({ module, node = 'LP_PAR-BEY_01', status = 'ONLINE', rightSlot, className = '' }: SystemBarProps) {
  return (
    <div className={`border-b border-[var(--lp-color-border-accent)] bg-[rgba(5,5,5,0.88)] ${className}`.trim()}>
      <div className="lp-shell flex min-h-[44px] items-center justify-between gap-3 py-[6px]">
        <div className="flex items-center gap-2">
          <span className="font-lp-ui text-[11px] uppercase text-[var(--lp-color-text-strong)]">{module}</span>
          <StatusChip label={`NODE: ${node}`} tone="neutral" />
          <StatusChip label={`STATUS: ${status}`} tone={status === 'ONLINE' ? 'success' : 'danger'} />
        </div>
        {rightSlot}
      </div>
    </div>
  );
}

interface PanelProps extends SimpleClassName {
  children: ReactNode;
}

export function Panel({ children, className = '' }: PanelProps) {
  return <section className={`lp-panel ${className}`.trim()}>{children}</section>;
}

interface WindowProps extends SimpleClassName {
  title: string;
  meta?: string;
  children: ReactNode;
}

export function Window({ title, meta, children, className = '' }: WindowProps) {
  return (
    <Panel className={className}>
      <PanelTitleBar title={title} meta={meta} />
      {children}
    </Panel>
  );
}

interface PanelTitleBarProps extends SimpleClassName {
  title: string;
  meta?: string;
}

export function PanelTitleBar({ title, meta, className = '' }: PanelTitleBarProps) {
  return (
    <div className={`lp-panel-title ${className}`.trim()}>
      <span className="font-lp-ui text-[11px] uppercase leading-[1.2] text-[var(--lp-color-text-strong)]">{title}</span>
      {meta ? <span className="lp-log max-w-full text-[10px] text-[var(--lp-color-text-muted)]">{meta}</span> : null}
    </div>
  );
}

interface StatusChipProps extends SimpleClassName {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}

export function StatusChip({ label, tone = 'neutral', className = '' }: StatusChipProps) {
  const toneClass =
    tone === 'success'
      ? 'border-[var(--lp-color-status-online)] text-[var(--lp-color-status-online)]'
      : tone === 'warning'
        ? 'border-[var(--lp-color-status-warning)] text-[var(--lp-color-status-warning)]'
        : tone === 'danger'
          ? 'border-[var(--lp-color-primary-300)] text-[var(--lp-color-primary-200)]'
          : 'border-[var(--lp-color-border-default)] text-[var(--lp-color-text-muted)]';

  return <span className={`lp-log border px-2 py-[2px] text-[10px] ${toneClass} ${className}`.trim()}>{label}</span>;
}

interface StatusStripProps extends SimpleClassName {
  children: ReactNode;
}

export function StatusStrip({ children, className = '' }: StatusStripProps) {
  return <div className={`lp-status-strip ${className}`.trim()}>{children}</div>;
}

interface CommandLinkProps extends SimpleClassName {
  href: string;
  label: string;
}

export function CommandText({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className="lp-command-link" data-active={active ? 'true' : undefined}>
      <span className="lp-command-prefix">&gt;</span>
      <span>{label}</span>
    </span>
  );
}

export function CommandLink({ href, label, className = '' }: CommandLinkProps) {
  return (
    <Link href={href} className={`inline-flex lp-focus-ring ${className}`.trim()}>
      <CommandText label={label} />
    </Link>
  );
}

interface LogStreamProps extends SimpleClassName {
  lines: string[];
}

export function LogStream({ lines, className = '' }: LogStreamProps) {
  return (
    <div className={`lp-log space-y-1 ${className}`.trim()}>
      {lines.map((line) => (
        <p key={line} className="m-0">
          {line}
        </p>
      ))}
    </div>
  );
}

interface DirectoryPreviewProps extends SimpleClassName {
  items: string[];
}

export function DirectoryPreview({ items, className = '' }: DirectoryPreviewProps) {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      {items.map((item) => (
        <p key={item} className="lp-log m-0 text-[10px] text-[var(--lp-color-text-muted)]">
          {item}
        </p>
      ))}
    </div>
  );
}

interface ExternalNodeStripProps extends SimpleClassName {
  nodes: string[];
}

export function ExternalNodeStrip({ nodes, className = '' }: ExternalNodeStripProps) {
  return (
    <div className={`flex flex-wrap gap-1 ${className}`.trim()}>
      {nodes.map((node) => (
        <span key={node} className="lp-log border border-[var(--lp-color-border-default)] px-2 py-1 text-[10px] text-[var(--lp-color-text-muted)]">
          {node}
        </span>
      ))}
    </div>
  );
}

interface BadgeStripProps extends SimpleClassName {
  items: string[];
}

export function BadgeStrip({ items, className = '' }: BadgeStripProps) {
  return (
    <div className={`flex flex-wrap gap-[6px] ${className}`.trim()}>
      {items.map((item) => (
        <span key={item} className="lp-log border border-[var(--lp-color-border-default)] bg-[rgba(0,0,0,0.45)] px-2 py-1 text-[10px]">
          {item}
        </span>
      ))}
    </div>
  );
}

export const LogBlock = LogStream;
