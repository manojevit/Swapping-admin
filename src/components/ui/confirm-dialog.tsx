"use client";

import { type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./modal";
import { Button } from "./button";

/** A controlled confirmation dialog for destructive actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Trash2 className="h-5 w-5" />}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </>
      }
    >
      {children ?? <p className="text-[13px] text-muted">This action cannot be undone.</p>}
    </Modal>
  );
}
