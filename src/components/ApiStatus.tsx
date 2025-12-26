import React, { useState, useEffect } from 'react';
import {  AnimatePresence } from 'framer-motion';
import { refreshToken } from '../utils/api';

const ApiStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
    try {

      await refreshToken(); 
    
    } catch (error) {
      setStatus('disconnected');
    }
  }
  };

  


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