import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal simples usando Portal para garantir que sempre apareça
 * acima de todos os outros elementos da página.
 */
export default function SimpleModal({ open, onClose, title, description, children }) {
  // Fecha o modal ao pressionar ESC
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '48rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.5rem',
            paddingRight: '3.5rem',
            borderBottom: '1px solid #27272a',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'white',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {description && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#71717a',
                  margin: '0.25rem 0 0 0',
                }}
              >
                {description}
              </p>
            )}
          </div>
          
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#a1a1aa',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3f3f46';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: '1.5rem',
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Usa createPortal para renderizar o modal no body
  return ReactDOM.createPortal(modalContent, document.body);
}
