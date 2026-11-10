// Jednoduché modální okno: zavírá se klávesou Esc, kliknutím vedle a zamyká scroll stránky.
import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ title, onClose, children, maxWidth = 540 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="app-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="app-modal" role="dialog" aria-modal="true" aria-label={title} style={{ maxWidth }}>
        <div className="app-modal-header">
          <h4>{title}</h4>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Zavřít">
            <FaTimes />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
      </div>
    </div>
  );
}
