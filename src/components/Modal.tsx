import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons';

interface Props {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ children, onClose, wide }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="ov"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`modal${wide ? ' wide' : ''}`}>
        <button className="btn x" onClick={onClose} aria-label="Закрыть">
          <CloseIcon size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}