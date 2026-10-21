import {
  ArrowLeftRight,
  BatteryWarning,
  CircleAlert,
  UserPlus,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { RECENT_ACTIVITY } from "@/lib/mock";
import { timeAgo } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const META: Record<ActivityItem["kind"], { icon: LucideIcon; tone: string; dot: string }> = {
  swap_completed: { icon: ArrowLeftRight, tone: "bg-success-soft text-success-ink", dot: "bg-success" },
  battery_returned: { icon: BatteryWarning, tone: "bg-warn-soft text-warn-ink", dot: "bg-warn" },
  station_offline: { icon: WifiOff, tone: "bg-danger-soft text-danger-ink", dot: "bg-warn" },
  rider_registered: { icon: UserPlus, tone: "bg-info-soft text-info-ink", dot: "bg-success" },
  swap_failed: { icon: CircleAlert, tone: "bg-danger-soft text-danger-ink", dot: "bg-danger" },
};

export function RecentActivity() {
  return (
    <ul className="space-y-1">
      {RECENT_ACTIVITY.map((item) => {
        const m = META[item.kind];
        const Icon = m.icon;
        return (
          <li key={item.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-canvas">
            <span className={`h-2 w-2 shrink-0 rounded-full ${m.dot}`} />
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${m.tone}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{item.title}</p>
              <p className="truncate text-[12px] text-muted">{item.subtitle}</p>
            </div>
            <span className="shrink-0 text-[12px] text-faint">{timeAgo(item.at)}</span>
          </li>
        );
      })}
    </ul>
  );
}
