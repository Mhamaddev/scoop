import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  getRecentNotifications: (limit?: number) => NotificationItem[];
  getNotificationsByType: (type: NotificationItem['type']) => NotificationItem[];
  getNotificationsByPriority: (priority: NotificationItem['priority']) => NotificationItem[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = (notificationData: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: NotificationItem = {
      ...notificationData,
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getRecentNotifications = (limit: number = 5) => {
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const getNotificationsByType = (type: NotificationItem['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getNotificationsByPriority = (priority: NotificationItem['priority']) => {
    return notifications.filter(notification => notification.priority === priority);
  };

  // Auto-generate notifications based on system events
  useEffect(() => {
    const checkDailyRate = () => {
      const today = new Date().toDateString();
      const hasRateNotificationToday = notifications.some(n => 
        n.type === 'rate' && 
        n.title.includes('Daily Dollar Rate Missing') &&
        new Date(n.createdAt).toDateString() === today
      );

      if (!hasRateNotificationToday) {
        // Simulate checking if daily rate is missing
        const shouldNotify = Math.random() > 0.7; // 30% chance for demo
        if (shouldNotify) {
          addNotification({
            type: 'rate',
            title: 'Daily Dollar Rate Missing',
            message: 'Daily dollar rate has not been entered for today. Please update the exchange rate.',
            priority: 'high'
          });
        }
      }
    };

    // Check for daily rate notification every hour
    const interval = setInterval(checkDailyRate, 60 * 60 * 1000);
    
    // Initial check
    checkDailyRate();

    return () => clearInterval(interval);
  }, [notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        getRecentNotifications,
        getNotificationsByType,
        getNotificationsByPriority
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};