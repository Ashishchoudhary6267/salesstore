import React from 'react';
import { useToast } from '../contexts/ToastContext';
import { BsCheckCircle, BsExclamationTriangle, BsInfoCircle, BsX } from 'react-icons/bs';

const Toast = ({ toast }) => {
  const { removeToast } = useToast();

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <BsCheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <BsExclamationTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <BsExclamationTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <BsInfoCircle className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg pointer-events-auto ${getBackgroundColor()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()}`}>
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => removeToast(toast.id)}
              className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-primary`}
            >
              <BsX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
