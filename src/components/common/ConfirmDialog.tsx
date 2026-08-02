import { useEffect, useRef } from 'react';

interface ConfirmDialogProps { open: boolean; title: string; description?: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void; }
export function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCancel(); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter(element => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusable.length - 1 : current - 1)
        : (current === focusable.length - 1 ? 0 : current + 1);
      event.preventDefault();
      focusable[next]?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); lastFocus.current?.focus(); };
  }, [open, onCancel]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4" role="presentation"><div ref={dialogRef} className="modal-shell w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title"><h2 id="confirm-dialog-title" className="type-section-title text-main">{title}</h2>{description ? <p className="type-body-sm mt-2">{description}</p> : null}<div className="mt-6 flex justify-end gap-2"><button ref={cancelRef} type="button" className="ghost-button" onClick={onCancel}>{cancelLabel}</button><button type="button" className="primary-button" onClick={onConfirm}>{confirmLabel}</button></div></div></div>;
}
