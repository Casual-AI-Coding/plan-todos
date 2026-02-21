'use client';

import { useToastContext, ToastType } from './ToastProvider';
// Re-export ToastProvider components
export { ToastProvider } from './ToastProvider';
export type { Toast, ToastType } from './ToastProvider';

const TOAST_ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '●',
  info: 'ℹ',
  warning: '⚠',
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: '#22C55E',
    icon: '#22C55E',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: '#EF4444',
    icon: '#EF4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: '#3B82F6',
    icon: '#3B82F6',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: '#F59E0B',
    icon: '#F59E0B',
  },
};

/**
 * Toast hook
 * 
 * Provides toast notification functions.
 * 
 * Usage:
 * ```tsx
 * const toast = useToast();
 * 
 * toast.success('保存成功');
 * toast.error('操作失败');
 * toast.info('提示信息');
 * toast.warning('警告信息');
 * ```
 */
export function useToast() {
  const { success, error, info, warning } = useToastContext();
  return { success, error, info, warning };
}

/**
 * ToastContainer
 * 
 * Renders all active toasts in a container.
 * Should be placed at the bottom-right of the screen.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in min-w-[280px] max-w-[400px]"
            style={{ 
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: 'var(--color-text)',
            }}
            role="alert"
          >
            {/* Icon */}
            <span 
              className="text-lg flex-shrink-0"
              style={{ color: style.icon }}
            >
              {TOAST_ICONS[toast.type]}
            </span>
            
            {/* Message */}
            <span className="flex-1 text-sm">
              {toast.message}
            </span>
            
            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        );
      })}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ToastContainer;
