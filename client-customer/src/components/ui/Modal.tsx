import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      window.addEventListener('keydown', handleKeyDown);
      // Focus modal container for accessibility
      modalRef.current?.focus();
      // Block body scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      // Return focus to the element that triggered the modal
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-surface rounded-xl shadow-2xl border border-slate-100 w-full max-w-[480px] p-6 max-h-[90vh] overflow-y-auto focus:outline-none flex flex-col gap-4 animate-fade-in"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <h2 id="modal-title" className="text-lg font-bold text-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
export default Modal;
