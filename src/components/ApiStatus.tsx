import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showStatus, setShowStatus] = useState(true);

  useEffect(() => {
    checkApiConnection();
    const interval = setInterval(checkApiConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch('http://198.168.1.7:8000/api/auth/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Even if we get 401 (unauthorized), it means the API is running
      if (response.status === 401 || response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      setStatus('disconnected');
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircleIcon,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          message: 'Django API Connected',
        };
      case 'disconnected':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          message: 'Django API Disconnected - Start backend server',
        };
      default:
        return {
          icon: ArrowPathIcon,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          message: 'Checking API Connection...',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  if (!showStatus) return null;

  return (
    <AnimatePresence>
      {/* <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg border ${config.bgColor} ${config.borderColor} shadow-lg`}
      >
        <div className="flex items-center space-x-3">
          <IconComponent 
            className={`w-5 h-5 ${config.color} ${status === 'checking' ? 'animate-spin' : ''}`} 
          />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.color}`}>
              {config.message}
            </p>
            {status === 'disconnected' && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Run: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">python manage.py runserver 8000</code>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowStatus(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
      </motion.div> */}
    </AnimatePresence>
  );
};

export default ApiStatus;