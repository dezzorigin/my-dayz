'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

type SheetContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const ctx = React.useContext(SheetContext);
  if (!ctx) {
    throw new Error('SheetContent must be used within Sheet');
  }
  return ctx;
}

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>
  );
}

export function SheetContent({
  side = 'right',
  className,
  children,
  ...rest
}: React.ComponentProps<'div'> & {
  side?: 'left' | 'right' | 'top' | 'bottom';
}) {
  const { open, onOpenChange } = useSheetContext();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup panel"
        className="fixed inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex flex-col bg-white shadow-lg outline-none',
          side === 'left' && 'inset-y-0 left-0 h-full border-r border-neutral-200',
          side === 'right' && 'inset-y-0 right-0 h-full border-l border-neutral-200',
          side === 'top' && 'inset-x-0 top-0 border-b border-neutral-200',
          side === 'bottom' && 'inset-x-0 bottom-0 border-t border-neutral-200',
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />;
}
