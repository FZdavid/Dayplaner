import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, GearIcon } from './icons';

/** Seitenkopf mit großem Titel (iOS „Large Title“). */
export function PageHeader({
  title,
  subtitle,
  back,
  right,
  showSettings = true,
}: {
  title: string;
  subtitle?: string;
  back?: { to: string; label: string };
  right?: ReactNode;
  showSettings?: boolean;
}) {
  return (
    <header className="px-4 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <div className="flex h-11 items-center justify-between">
        {back ? (
          <Link to={back.to} className="-ml-2 flex items-center text-accent active:opacity-50">
            <ChevronLeftIcon className="size-7" />
            <span className="text-[17px]">{back.label}</span>
          </Link>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          {right}
          {showSettings && (
            <Link to="/settings" aria-label="Einstellungen" className="text-accent active:opacity-50">
              <GearIcon />
            </Link>
          )}
        </div>
      </div>
      {subtitle && <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">{subtitle}</p>}
      <h1 className="text-[34px] font-bold leading-tight tracking-tight">{title}</h1>
    </header>
  );
}

/** Gruppierte Liste wie in den iOS-Einstellungen. */
export function Section({ title, footer, children }: { title?: string; footer?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      {title && <h2 className="mb-1.5 px-4 text-[13px] uppercase tracking-wide text-muted">{title}</h2>}
      <div className="overflow-hidden rounded-xl bg-card">{children}</div>
      {footer && <div className="mt-1.5 px-4 text-[13px] text-muted">{footer}</div>}
    </section>
  );
}

export function Row({
  children,
  detail,
  to,
  onClick,
  danger,
}: {
  children: ReactNode;
  detail?: ReactNode;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const cls = `flex min-h-11 w-full items-center gap-3 border-b border-sep px-4 py-2.5 text-left text-[17px] last:border-b-0 ${
    danger ? 'text-danger' : ''
  } ${to || onClick ? 'active:bg-sep' : ''}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        <span className="flex-1">{children}</span>
        {detail !== undefined && <span className="text-muted">{detail}</span>}
        <ChevronRightIcon className="size-5 text-muted" />
      </Link>
    );
  }
  const content = (
    <>
      {children}
      {detail !== undefined && <span className="ml-auto text-muted">{detail}</span>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${
        checked ? 'bg-success' : 'bg-sep'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] size-[27px] rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'plain' }) {
  const styles = {
    primary: 'bg-accent text-white disabled:opacity-40',
    secondary: 'bg-accent/15 text-accent disabled:opacity-40',
    plain: 'text-accent disabled:opacity-40',
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`rounded-xl px-4 py-2.5 text-[17px] font-semibold active:opacity-60 ${styles} ${className}`}
    />
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-[9px] bg-sep/70 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[7px] py-1.5 text-[13px] font-semibold transition-colors ${
            value === o.value ? 'bg-card shadow-sm dark:bg-[#636366]' : 'text-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, text }: { icon?: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      {icon && <div className="mb-3 text-5xl">{icon}</div>}
      <p className="text-[17px] font-semibold">{title}</p>
      {text && <p className="mt-1 text-[15px] text-muted">{text}</p>}
    </div>
  );
}
