// context/NotificationContext.jsx
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const success = (message, duration = 3000) => 
    showNotification(message, 'success', duration);
  
  const error = (message, duration = 3000) => 
    showNotification(message, 'error', duration);
  
  const warning = (message, duration = 3000) => 
    showNotification(message, 'warning', duration);
  
  const info = (message, duration = 3000) => 
    showNotification(message, 'info', duration);

  return (
    <NotificationContext.Provider 
      value={{ 
        success, 
        error, 
        warning, 
        info, 
        removeNotification 
      }}
    >
      {children}
      
      {/* Render all notifications */}
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};