import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          icon: <AlertCircle className="w-5 h-5" />
        };
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  const config = getTypeConfig();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg max-w-md ${config.bgColor}`}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${config.textColor}`}>
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {title}
          </h3>
          <div className={`mt-1 text-sm ${config.textColor} opacity-90`}>
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 ${config.textColor} hover:opacity-75 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default Notification;