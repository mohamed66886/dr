import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

interface AdminMessageProps {
  message: string;
  type?: MessageType;
  onClose?: () => void;
  duration?: number;
}

const typeConfig: Record<MessageType, {
  bg: string;
  text: string;
  border: string;
  icon: JSX.Element;
}> = {
  success: {
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-200',
    icon: <FiCheckCircle className="text-teal-500" size={20} />
  },
  error: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: <FiAlertCircle className="text-rose-500" size={20} />
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: <FiInfo className="text-blue-500" size={20} />
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: <FiAlertCircle className="text-amber-500" size={20} />
  }
};

export const AdminMessage = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}: AdminMessageProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = typeConfig[type];

  // إغلاق الرسالة تلقائياً بعد المدة المحددة
  if (duration) {
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border ${config.bg} ${config.border} shadow-lg flex items-center gap-3 max-w-md`}
        >
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex-1 text-sm font-medium ${config.text}`}
          >
            {message}
          </motion.div>
          
          {onClose && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={18} />
            </motion.button>
          )}
          
          {/* شريط التقدم للرسالة */}
          {duration && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-teal-400' : ''} 
                          ${type === 'error' ? 'bg-rose-400' : ''} 
                          ${type === 'info' ? 'bg-blue-400' : ''}
                          ${type === 'warning' ? 'bg-amber-400' : ''}`}
              style={{ originX: 0 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export function useAdminMessage(defaultDuration = 5000) {
  const [msg, setMsg] = useState<{
    message: string;
    type: MessageType;
    duration?: number;
  } | null>(null);

  const showMessage = (
    message: string, 
    type: MessageType = 'info',
    duration?: number
  ) => {
    setMsg({ message, type, duration: duration ?? defaultDuration });
  };

  const MessageComponent = msg ? (
    <AdminMessage 
      message={msg.message} 
      type={msg.type} 
      onClose={() => setMsg(null)}
      duration={msg.duration}
    />
  ) : null;

  return { showMessage, MessageComponent };
}