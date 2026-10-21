"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface RowMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean; // draws a separator above this item
}

/** A compact kebab (⋮) dropdown of row actions. */
export function RowMenu({ items }: { items: RowMenuItem[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <Button variant="secondary" size="sm" onClick={() => setOpen((x) => !x)} aria-label="More actions">
        <MoreVertical className="h-3.5 w-3.5" />
      </Button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1 text-left shadow-pop">
            {items.map((it, i) => (
              <div key={i}>
                {it.divider ? <div className="my-1 border-t border-line" /> : null}
                <button
                  onClick={() => { setOpen(false); it.onClick(); }}
                  className={cn("flex w-full items-center px-3.5 py-2 text-left text-[13px] hover:bg-canvas", it.danger ? "text-danger" : "text-ink")}
                >
                  {it.label}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
