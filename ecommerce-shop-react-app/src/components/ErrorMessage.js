import React from 'react';
import { BsExclamationTriangle } from 'react-icons/bs';

const ErrorMessage = ({ message, onRetry, showRetry = false }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <BsExclamationTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {showRetry && onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
