import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Bell, 
  BellRing, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Users,
  Clock,
  Filter,
  Settings
} from 'lucide-react';
import Button from '../Common/Button';

const NotificationDropdown: React.FC = () => {
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <FileText className="w-4 h-4" />;
      case 'expense':
        return <DollarSign className="w-4 h-4" />;
      case 'payroll':
        return <Users className="w-4 h-4" />;
      case 'rate':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
    if (priority === 'medium') return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
    
    switch (type) {
      case 'invoice':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'expense':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'payroll':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'rate':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high') return notification.priority === 'high';
    return true;
  }).slice(0, 10); // Limit to 10 most recent

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'high', label: 'High', count: notifications.filter(n => n.priority === 'high').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as 'all' | 'unread' | 'high')}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    filter === tab.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex space-x-2">
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark All Read
                </Button>
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {filter === 'unread' ? 'No unread notifications' :
                   filter === 'high' ? 'No high priority notifications' :
                   'No notifications yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        getNotificationColor(notification.type, notification.priority)
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.isRead 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              {notification.priority === 'high' && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded">
                                  High
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                              title="Delete notification"
                            >
                              <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to full notifications page
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                View All Notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;