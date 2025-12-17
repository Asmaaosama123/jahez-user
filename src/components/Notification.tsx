// components/Notification.jsx
import React, { useEffect, useState } from "react";

const Notification = ({ 
  message, 
  type = "success", 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      startExitAnimation();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const startExitAnimation = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleClose = () => {
    startExitAnimation();
  };

  const typeStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✅"
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "❌"
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "⚠️"
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ️"
    }
  };

  const styles = typeStyles[type];

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div
        className={`${styles.bg} ${styles.border} border ${styles.text} 
          rounded-lg shadow-lg p-4 max-w-sm w-full 
          transition-all duration-300 ease-in-out
          ${isExiting ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 text-xl mr-3">
            {styles.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600 
                     transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${type === 'success' ? 'bg-green-500' : 
                        type === 'error' ? 'bg-red-500' : 
                        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Notification;