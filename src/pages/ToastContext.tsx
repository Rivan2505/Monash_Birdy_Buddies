import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

const ToastContainer = ({ toasts }: { toasts: Toast[] }) => (
  <div style={{
    position: 'fixed',
    top: 24,
    right: 24,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
    minWidth: 240,
    pointerEvents: 'none',
  }}>
    {toasts.map((toast) => (
      <div
        key={toast.id}
        style={{
          background: toast.type === 'success' ? '#eafaf1' : toast.type === 'error' ? '#fdecea' : '#eaf3fb',
          color: toast.type === 'success' ? '#219653' : toast.type === 'error' ? '#c0392b' : '#1976d2',
          border: '1.5px solid #b2dfdb',
          borderLeft: `6px solid ${toast.type === 'success' ? '#4CAF50' : toast.type === 'error' ? '#e74c3c' : '#1976d2'}`,
          borderRadius: 10,
          boxShadow: '0 2px 12px rgba(44,62,80,0.10)',
          padding: '1rem 1.5rem 1rem 1.2rem',
          fontWeight: 600,
          fontSize: '1.05rem',
          pointerEvents: 'auto',
          minWidth: 220,
        }}
      >
        {toast.message}
      </div>
    ))}
  </div>
); 