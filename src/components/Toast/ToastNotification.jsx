import React, { useEffect } from 'react';

/**
 * Toast Notification Component (Tailwind CSS)
 * @param {Object} props
 * @param {boolean} props.show
 * @param {string} props.type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} props.title
 * @param {string} props.message
 * @param {Function} props.onClose
 * @param {number} [props.duration=4000]
 */
export const ToastNotification = ({
  show,
  type = 'info',
  title,
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const typeConfig = {
    success: {
      bgColor: 'bg-emerald-50 border-emerald-500 text-emerald-800',
      iconBg: 'bg-emerald-500 text-white',
      titleColor: 'text-emerald-900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bgColor: 'bg-red-50 border-red-500 text-red-800',
      iconBg: 'bg-red-500 text-white',
      titleColor: 'text-red-900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      bgColor: 'bg-amber-50 border-amber-500 text-amber-800',
      iconBg: 'bg-amber-500 text-white',
      titleColor: 'text-amber-900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      bgColor: 'bg-blue-50 border-blue-500 text-blue-800',
      iconBg: 'bg-blue-500 text-white',
      titleColor: 'text-blue-900',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4">
      <div
        className={`flex items-start p-4 rounded-2xl shadow-xl border-l-4 ${config.bgColor} backdrop-blur-md bg-opacity-95 transition-all duration-300 transform scale-100`}
      >
        <div className={`flex-shrink-0 p-1.5 rounded-xl ${config.iconBg} mr-3 shadow-sm`}>
          {config.icon}
        </div>
        <div className="flex-1 mr-2">
          {title && <h4 className={`text-sm font-bold ${config.titleColor}`}>{title}</h4>}
          <p className="text-xs font-medium opacity-90 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-black/5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
