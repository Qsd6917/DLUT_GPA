import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

type DropdownAlign = 'start' | 'end';

export interface FilterDropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  icon: React.ReactNode;
  label: string;
  menuLabel: string;
  options: FilterDropdownOption[];
  selectedValue: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: string) => void;
  triggerClassName: string;
  menuWidth?: number;
  align?: DropdownAlign;
}

interface MenuPosition {
  left: number;
  top: number;
  minWidth: number;
  visibility: 'hidden' | 'visible';
}

const VIEWPORT_PADDING = 16;
const MENU_OFFSET = 12;

const getViewportConstrainedLeft = (left: number, menuWidth: number) => {
  const maxLeft = Math.max(
    VIEWPORT_PADDING,
    window.innerWidth - menuWidth - VIEWPORT_PADDING
  );
  return Math.min(Math.max(VIEWPORT_PADDING, left), maxLeft);
};

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  icon,
  label,
  menuLabel,
  options,
  selectedValue,
  isOpen,
  onOpenChange,
  onSelect,
  triggerClassName,
  menuWidth,
  align = 'start',
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const listboxId = useId();
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    left: -9999,
    top: -9999,
    minWidth: 0,
    visibility: 'hidden',
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const resolvedMenuWidth =
      menuWidth ?? Math.max(triggerRect.width, menuRect.width);
    const nextLeft =
      align === 'end'
        ? triggerRect.right - resolvedMenuWidth
        : triggerRect.left;
    const constrainedLeft = getViewportConstrainedLeft(
      nextLeft,
      resolvedMenuWidth
    );
    const fitsBelow =
      triggerRect.bottom + MENU_OFFSET + menuRect.height <=
      window.innerHeight - VIEWPORT_PADDING;
    const nextTop = fitsBelow
      ? triggerRect.bottom + MENU_OFFSET
      : Math.max(
          VIEWPORT_PADDING,
          triggerRect.top - MENU_OFFSET - menuRect.height
        );

    setMenuPosition({
      left: constrainedLeft,
      top: nextTop,
      minWidth: Math.max(triggerRect.width, resolvedMenuWidth),
      visibility: 'visible',
    });
  }, [align, menuWidth]);

  const schedulePositionUpdate = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = window.requestAnimationFrame(() => {
      updatePosition();
      rafRef.current = null;
    });
  }, [updatePosition]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPosition(current => ({ ...current, visibility: 'hidden' }));
      return;
    }

    schedulePositionUpdate();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOpen, schedulePositionUpdate]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };

    const handleWindowChange = () => {
      schedulePositionUpdate();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, {
      capture: true,
      passive: true,
    });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && triggerRef.current
        ? new ResizeObserver(() => {
            schedulePositionUpdate();
          })
        : null;

    if (resizeObserver && triggerRef.current) {
      resizeObserver.observe(triggerRef.current);
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
      resizeObserver?.disconnect();
    };
  }, [isOpen, onOpenChange, schedulePositionUpdate]);

  const handleOptionSelect = (value: string) => {
    onSelect(value);
    onOpenChange(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className={triggerClassName}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              className="dropdown-menu-panel z-[70]"
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: menuPosition.minWidth,
                width: menuWidth,
                visibility: menuPosition.visibility,
              }}
            >
              <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {menuLabel}
              </div>
              <div
                id={listboxId}
                role="listbox"
                aria-label={menuLabel}
                className="max-h-72 space-y-1 overflow-y-auto px-2 pb-2"
              >
                {options.map(option => {
                  const isSelected = option.value === selectedValue;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`flex w-full items-center justify-between rounded-[0.8rem] px-3 py-2.5 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-primary text-white'
                          : 'text-main hover:bg-[hsl(var(--surface-2))] dark:hover:bg-[hsl(var(--surface-3))]'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected ? <Check size={15} /> : null}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};
