import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

type DialogProps = React.ComponentProps<typeof ConfirmDialog>;

const defaultProps: DialogProps = {
  open: true,
  title: '重置全部数据',
  description: '此操作会清空当前课程与实验数据，且无法撤销。',
  confirmLabel: '确认重置',
  cancelLabel: '取消',
  onConfirm: () => {},
  onCancel: () => {},
};

const renderDialog = (props: Partial<DialogProps> = {}) =>
  render(<ConfirmDialog {...defaultProps} {...props} />);

describe('ConfirmDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  test('renders title, description and both actions while open, and nothing while closed', () => {
    const { rerender } = renderDialog();

    expect(
      screen.getByRole('dialog', { name: '重置全部数据' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '重置全部数据' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('此操作会清空当前课程与实验数据，且无法撤销。')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '确认重置' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('重置全部数据')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '确认重置' })
    ).not.toBeInTheDocument();
  });

  test('omits the description paragraph when no description is provided', () => {
    renderDialog({ description: undefined });

    expect(
      screen.getByRole('dialog', { name: '重置全部数据' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('此操作会清空当前课程与实验数据，且无法撤销。')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('dialog').querySelector('p')).toBeNull();
  });

  test('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderDialog({ onConfirm, onCancel });

    fireEvent.click(screen.getByRole('button', { name: '确认重置' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  test('calls onCancel when the cancel button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    renderDialog({ onConfirm, onCancel });

    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('calls onCancel once when Escape is pressed and ignores other keys', () => {
    const onCancel = vi.fn();

    renderDialog({ onCancel });

    fireEvent.keyDown(document, { key: 'a' });
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  test('does not dismiss when the overlay area around the dialog is clicked', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    renderDialog({ onCancel, onConfirm });

    const dialog = screen.getByRole('dialog');
    // 遮罩层是对话框的直接父节点，点击它相当于点击对话框外的空白区域。
    fireEvent.click(dialog.parentElement as HTMLElement);

    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', { name: '重置全部数据' })
    ).toBeInTheDocument();
  });

  test('moves focus into the dialog on open and restores it to the trigger on close', async () => {
    const user = userEvent.setup();

    const Harness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            打开重置确认
          </button>
          <ConfirmDialog
            {...defaultProps}
            open={open}
            onCancel={() => setOpen(false)}
          />
        </>
      );
    };

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: '打开重置确认' }));

    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '打开重置确认' })).toHaveFocus();
  });

  test('locks body scroll while open and restores the previous value on close', () => {
    const { rerender } = renderDialog();

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<ConfirmDialog {...defaultProps} open={false} />);

    expect(document.body.style.overflow).toBe('');
  });

  test('keeps an existing body scroll lock after closing', () => {
    document.body.style.overflow = 'hidden';

    const { rerender } = renderDialog();

    expect(document.body.style.overflow).toBe('hidden');

    rerender(<ConfirmDialog {...defaultProps} open={false} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('traps Tab focus inside the dialog and wraps in both directions', () => {
    renderDialog();

    const cancel = screen.getByRole('button', { name: '取消' });
    const confirm = screen.getByRole('button', { name: '确认重置' });

    expect(cancel).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(confirm).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(cancel).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(confirm).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(cancel).toHaveFocus();
  });

  test('pulls focus back into the dialog when Tab is pressed from outside', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            外部按钮
          </button>
          <ConfirmDialog {...defaultProps} open={open} />
        </>
      );
    };

    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: '外部按钮' }));

    const outside = screen.getByRole('button', { name: '外部按钮' });
    outside.focus();
    expect(outside).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

    outside.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: '确认重置' })).toHaveFocus();
  });

  test('restores body scroll and focus when unmounted while open', () => {
    const trigger = document.createElement('button');
    trigger.textContent = '页面上的触发按钮';
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = renderDialog();

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

    unmount();

    expect(document.body.style.overflow).toBe('');
    expect(trigger).toHaveFocus();

    trigger.remove();
  });

  test('opens and closes safely when no element is focused beforehand', () => {
    // jsdom 的 activeElement 通常是 body；这里模拟"焦点不在任何元素上"的场景，
    // 覆盖 activeElement 不是 HTMLElement 时的兜底分支。
    // 断言前必须恢复真实的 activeElement，否则 toHaveFocus 读到的永远是 null。
    const activeElementSpy = vi
      .spyOn(document, 'activeElement', 'get')
      .mockReturnValue(null);

    const onCancel = vi.fn();
    const { rerender } = renderDialog({ onCancel });

    activeElementSpy.mockRestore();

    expect(
      screen.getByRole('dialog', { name: '重置全部数据' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <ConfirmDialog {...defaultProps} open={false} onCancel={onCancel} />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  test('stays usable when the parent re-renders with a new onCancel identity', () => {
    const firstCancel = vi.fn();
    const secondCancel = vi.fn();

    const { rerender } = renderDialog({ onCancel: firstCancel });

    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

    rerender(<ConfirmDialog {...defaultProps} onCancel={secondCancel} />);

    // 重新渲染后对话框仍然锁定滚动、焦点仍在取消按钮上，且用最新的回调。
    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('button', { name: '取消' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(secondCancel).toHaveBeenCalledTimes(1);
    expect(firstCancel).not.toHaveBeenCalled();

    rerender(
      <ConfirmDialog {...defaultProps} open={false} onCancel={secondCancel} />
    );

    expect(document.body.style.overflow).toBe('');
  });
});
