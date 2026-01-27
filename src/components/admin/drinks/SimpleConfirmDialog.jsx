import React, { useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle } from 'lucide-react';

/**
 * Diálogo de confirmação simples usando Portal.
 */
export default function SimpleConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning'
}) {
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

  const confirmButtonColor = variant === 'danger' 
    ? { bg: '#ef4444', hover: '#dc2626' }
    : { bg: '#f59e0b', hover: '#d97706' };

  const dialogContent = (
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

      {/* Dialog */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '28rem',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '9999px',
            backgroundColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle 
            size={24} 
            style={{ color: variant === 'danger' ? '#ef4444' : '#f59e0b' }} 
          />
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'white',
            margin: '0 0 0.5rem 0',
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: '#a1a1aa',
            margin: '0 0 1.5rem 0',
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #3f3f46',
              color: '#d4d4d8',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: confirmButtonColor.bg,
              border: 'none',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = confirmButtonColor.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = confirmButtonColor.bg;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(dialogContent, document.body);
}
