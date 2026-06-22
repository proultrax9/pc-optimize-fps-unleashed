import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  loading?: boolean;
};

export function StatCard({ icon: Icon, label, value, subValue, loading }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-border-glow hover:bg-card-hover">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-elevated" />
          ) : (
            <p className="mt-1.5 truncate text-[15px] font-semibold leading-snug text-text">
              {value}
            </p>
          )}
          {subValue && !loading && (
            <p className="mt-0.5 font-mono text-[11px] text-text-secondary">{subValue}</p>
          )}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-elevated">
          <Icon className="h-3.5 w-3.5 text-accent opacity-80" />
        </div>
      </div>
    </div>
  );
}

type PageHeaderProps = {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-0.5 text-[13px] text-text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
