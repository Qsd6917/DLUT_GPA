import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // 滚动锁交给引用计数版本，与其它弹窗共享同一份计数，
  // 避免并发弹窗时各自保存/恢复 overflow 导致顺序反转后残留锁定。
  useBodyScrollLock(open);

  // 焦点管理只依赖 open。若把 onCancel 也放进依赖，父组件每次渲染传入新的
  // 内联回调都会让 effect 重跑，把用户用 Tab 移到的「确认」按钮弹回「取消」。
  useEffect(() => {
    if (!open) return undefined;
    lastFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    cancelRef.current?.focus();
    return () => {
      lastFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // 阻止继续冒泡到 window，避免与其它监听 keydown 的弹窗同时响应同一次 Escape。
        event.stopPropagation();
        onCancel();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter(element => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? current <= 0
          ? focusable.length - 1
          : current - 1
        : current === focusable.length - 1
          ? 0
          : current + 1;
      event.preventDefault();
      focusable[next]?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4"
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="modal-shell w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2 id="confirm-dialog-title" className="type-section-title text-main">
          {title}
        </h2>
        {description ? (
          <p className="type-body-sm mt-2">{description}</p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            className="ghost-button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
