import { SLOT_OCCUPANCY } from "@/lib/mock";

export function SlotOccupancy() {
  const { occupied, empty, total } = SLOT_OCCUPANCY;
  const pct = Math.round((occupied / total) * 100);
  return (
    <div>
      <p className="nums text-[26px] font-bold text-ink">
        {occupied} <span className="text-faint">/ {total}</span>
      </p>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-4 flex items-center gap-6 text-[13px]">
        <span className="flex items-center gap-2 text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-success" /> Occupied
          <span className="nums font-semibold text-ink">{occupied}</span>
        </span>
        <span className="flex items-center gap-2 text-muted">
          <span className="h-2.5 w-2.5 rounded-full bg-black/15" /> Empty
          <span className="nums font-semibold text-ink">{empty}</span>
        </span>
      </div>
    </div>
  );
}
