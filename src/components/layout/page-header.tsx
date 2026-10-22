import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumb?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {breadcrumb ? <p className="mb-1.5 text-[13px] font-medium text-muted">{breadcrumb}</p> : null}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-[14px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
