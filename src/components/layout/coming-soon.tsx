"use client";

import { Hammer, Lock } from "lucide-react";
import { PageHeader } from "./page-header";
import { useSession } from "@/lib/session";
import type { Permission } from "@/lib/session";

/**
 * Placeholder for screens not yet built (Phase 2+). If `requires` is set and
 * the current role lacks it, we show a no-access state instead — this is the
 * same role gate that will protect the real screens.
 */
export function ComingSoon({
  title,
  subtitle,
  requires,
}: {
  title: string;
  subtitle?: string;
  requires?: Permission;
}) {
  const { can } = useSession();

  if (requires && !can(requires)) {
    return (
      <div>
        <PageHeader title={title} subtitle={subtitle} />
        <div className="grid place-items-center rounded-2xl border border-line bg-surface py-24 text-center shadow-card">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-danger-soft text-danger-ink">
            <Lock className="h-6 w-6" />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">No access</p>
          <p className="mt-1 max-w-sm text-[13px] text-muted">
            This section is available to administrators only. Switch the preview role to Admin to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface py-24 text-center shadow-card">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Hammer className="h-6 w-6" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-ink">Screen designed — build queued</p>
        <p className="mt-1 max-w-md text-[13px] text-muted">
          The approved design for <span className="font-semibold text-ink">{title}</span> is next in the build
          order. The shell, role gating and data layer are already wired, so this slots straight in.
        </p>
      </div>
    </div>
  );
}
