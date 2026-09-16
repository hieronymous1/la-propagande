import Link from 'next/link';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

interface SimpleClassName {
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

interface PanelProps extends SimpleClassName {
  children: ReactNode;
  raised?: boolean;
  accent?: boolean;
  interactive?: boolean;
  ticks?: boolean;
  /** stagger index for entrance reveal */
  reveal?: number;
  as?: 'section' | 'article' | 'div' | 'aside';
  id?: string;
  'data-testid'?: string;
}

export function Panel({
  children,
  className = '',
  raised,
  accent,
  interactive,
  ticks,
  reveal,
  as: Tag = 'section',
  ...rest
}: PanelProps) {
  const classes = [
    'lp-panel',
    raised ? 'lp-panel--raised' : '',
    accent ? 'lp-panel--accent' : '',
    interactive ? 'lp-panel--interactive' : '',
    ticks ? 'lp-panel--ticks' : '',
    reveal !== undefined ? 'lp-reveal' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const style = reveal !== undefined ? ({ '--i': reveal } as CSSProperties) : undefined;
  return (
    <Tag className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}

interface PanelTitleBarProps extends SimpleClassName {
  title: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export function PanelTitleBar({ title, meta, action, className = '' }: PanelTitleBarProps) {
  return (
    <div className={`lp-panel-title ${className}`.trim()}>
      <span className="lp-panel-title__name">{title}</span>
      {action ? action : meta ? <span className="lp-panel-title__meta">{meta}</span> : null}
    </div>
  );
}

export function PanelBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`lp-panel-body ${className}`.trim()}>{children}</div>;
}

interface WindowProps extends PanelProps {
  title: string;
  meta?: ReactNode;
}

export function Window({ title, meta, children, ...rest }: WindowProps) {
  return (
    <Panel {...rest}>
      <PanelTitleBar title={title} meta={meta} />
      {children}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Status                                                              */
/* ------------------------------------------------------------------ */

export type ChipTone = 'neutral' | 'success' | 'warning' | 'danger' | 'locked' | 'info' | 'accent';

interface StatusChipProps extends SimpleClassName {
  label: string;
  tone?: ChipTone;
  dot?: boolean;
}

export function StatusChip({ label, tone = 'neutral', dot, className = '' }: StatusChipProps) {
  return (
    <span className={`lp-chip ${dot ? 'lp-chip--dot' : ''} ${className}`.trim()} data-tone={tone}>
      {label}
    </span>
  );
}

interface StatusStripProps extends SimpleClassName {
  children: ReactNode;
}

export function StatusStrip({ children, className = '' }: StatusStripProps) {
  return (
    <div className={`lp-status-strip ${className}`.trim()} role="status">
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'default' | 'primary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

function buttonClasses({ variant = 'default', size = 'md', block, className = '' }: Omit<ButtonBaseProps, 'children'>) {
  return [
    'lp-btn',
    variant === 'primary' ? 'lp-btn--primary' : '',
    variant === 'ghost' ? 'lp-btn--ghost' : '',
    size === 'sm' ? 'lp-btn--sm' : '',
    size === 'lg' ? 'lp-btn--lg' : '',
    block ? 'lp-btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant,
  size,
  block,
  arrow,
  className,
  children,
  ...rest
}: ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, block, className })} {...rest}>
      {children}
      {arrow ? <span className="lp-btn__arrow" aria-hidden>&gt;</span> : null}
    </button>
  );
}

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  external?: boolean;
  onClick?: () => void;
}

export function ButtonLink({ href, external, variant, size, block, arrow, className, children, onClick }: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, block, className });
  const content = (
    <>
      {children}
      {arrow ? <span className="lp-btn__arrow" aria-hidden>&gt;</span> : null}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Command text (home)                                                 */
/* ------------------------------------------------------------------ */

export function CommandText({ label, active }: { label: string; active?: boolean }) {
  return (
    <span className="lp-command-link" data-active={active ? 'true' : undefined}>
      <span className="lp-command-prefix">&gt;</span>
      <span>{label}</span>
    </span>
  );
}

interface CommandLinkProps extends SimpleClassName {
  href: string;
  label: string;
}

export function CommandLink({ href, label, className = '' }: CommandLinkProps) {
  return (
    <Link href={href} className={`inline-flex lp-focus-ring ${className}`.trim()}>
      <CommandText label={label} />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Logs / lists                                                        */
/* ------------------------------------------------------------------ */

interface LogStreamProps extends SimpleClassName {
  lines: string[];
}

export function LogStream({ lines, className = '' }: LogStreamProps) {
  return (
    <div className={`lp-log space-y-[3px] ${className}`.trim()}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`} className="m-0 flex gap-2">
          <span className="text-[var(--lp-color-text-dim)]">{String(index + 1).padStart(2, '0')}</span>
          <span>{line}</span>
        </p>
      ))}
    </div>
  );
}

export const LogBlock = LogStream;

interface DirectoryPreviewProps extends SimpleClassName {
  items: string[];
}

export function DirectoryPreview({ items, className = '' }: DirectoryPreviewProps) {
  return (
    <div className={`space-y-1 ${className}`.trim()}>
      {items.map((item) => (
        <p key={item} className="lp-log m-0">
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
    <div className={`flex flex-wrap gap-[6px] ${className}`.trim()}>
      {nodes.map((node) => (
        <StatusChip key={node} label={node} dot />
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
        <StatusChip key={item} label={item} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metadata list                                                       */
/* ------------------------------------------------------------------ */

export interface MetaField {
  label: string;
  value: ReactNode;
}

export function MetaList({ fields, className = '' }: { fields: MetaField[]; className?: string }) {
  return (
    <dl className={`lp-meta m-0 ${className}`.trim()}>
      {fields.map((field) => (
        <div key={field.label} className="contents">
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

interface PageHeaderProps {
  module: string;
  title: string;
  strip: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ module, title, strip, children }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <StatusStrip>{strip}</StatusStrip>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="lp-label m-0 text-[var(--lp-color-primary-400)]">{module}</p>
          <h1 className="lp-display lp-display-lg m-0 text-[var(--lp-color-text-strong)]">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Legacy shells kept for compatibility                                */
/* ------------------------------------------------------------------ */

interface ShellProps extends SimpleClassName {
  children: ReactNode;
  statusStrip?: ReactNode;
}

export function OSShell({ children, statusStrip, className = '' }: ShellProps) {
  return (
    <div className={`lp-shell pb-4 ${className}`.trim()}>
      {children}
      {statusStrip ? <div className="mt-3">{statusStrip}</div> : null}
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
          <span className="lp-label text-[var(--lp-color-text-strong)]">{module}</span>
          <StatusChip label={`NODE: ${node}`} tone="neutral" />
          <StatusChip label={`STATUS: ${status}`} tone={status === 'ONLINE' ? 'success' : 'danger'} />
        </div>
        {rightSlot}
      </div>
    </div>
  );
}
