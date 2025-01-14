// components/Alert.js
import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon, TrashIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';


const Alert = ({ type, message, onClose }) => {
  // Apply the fade-in effect after the component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close alert after 5 seconds

    return () => clearTimeout(timeout);
  }, [onClose]);

  let alertStyle = '';

  switch (type) {
    case 'success':
      alertStyle = 'bg-green-100 text-green-800 border-l-4 border-green-500';
      break;
    case 'error':
      alertStyle = 'bg-red-100 text-red-800 border-l-4 border-red-500';
      break;
    case 'info':
      alertStyle = 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      break;
    case 'warning':
      alertStyle = 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      break;
    default:
      alertStyle = 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
  }

  return (
    <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-500 opacity-50" onClick={onClose}></div>
      
      {/* Alert Box */}
      <div
        className={`p-6 rounded-md shadow-lg transition-all duration-500 transform ease-in-out ${alertStyle} animate-fadeInTop max-w-md w-full z-10`}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 mr-2 "/>
          </div> 
          <div className="ml-3">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-auto">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6 ml-2"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
