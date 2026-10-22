import { Lock } from "lucide-react";
import { PageHeader } from "./page-header";

/**
 * Shown when a role reaches a screen it isn't allowed to see (usually by
 * typing the URL directly — the nav already hides the link). Same gate the
 * ComingSoon placeholder uses, pulled out so real pages can reuse it.
 */
export function NoAccess({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid place-items-center rounded-2xl border border-line bg-surface py-24 text-center shadow-card">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/[0.045] text-muted">
          <Lock className="h-6 w-6" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-ink">Admin only</p>
        <p className="mt-1 max-w-sm text-[13px] text-muted">
          This section is available to administrators. Switch the preview role to Admin to view it.
        </p>
      </div>
    </div>
  );
}
