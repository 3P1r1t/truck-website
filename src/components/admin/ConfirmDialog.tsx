"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loading,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            disabled={loading}
            onClick={async () => {
              await onConfirm();
            }}
          >
            {confirmText}
          </Button>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
