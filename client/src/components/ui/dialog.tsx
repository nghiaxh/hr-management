import * as React from 'react';
import { Modal } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

function Dialog({ open: controlledOpen, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={setOpen}>
      {children}
    </Modal.Root>
  );
}

function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Modal.Backdrop>
      <Modal.Container>
        <Modal.Dialog className={cn('max-h-[85vh]', className)}>
          <Modal.CloseTrigger className="absolute right-3 top-3 z-10 text-muted hover:text-foreground">
            <X weight="bold" />
          </Modal.CloseTrigger>
          {children}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4 pr-8', className)}>{children}</div>;
}

function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold tracking-tight text-foreground', className)}>{children}</h3>;
}

function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm text-muted', className)}>{children}</p>;
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
