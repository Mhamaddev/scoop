import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Bell, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Users, 
  Clock, 
  Eye, 
  EyeOff,
  Trash2,
  Filter,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Button from '../Common/Button';

interface RecentNotificationsProps {
  limit?: number;
  showActions?: boolean;
  compact?: boolean;
  notifications?: NotificationItem[];
  filterPeriod?: string;
}

const RecentNotifications: React.FC<RecentNotificationsProps> = ({ 
  limit = 5, 
  showActions = true,
  compact = false,
  notifications: propNotifications,
  filterPeriod
}) => {
  const { t } = useLanguage();
  const {
    notifications,
    markAsRead,
    deleteNotification,
    getRecentNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  
  // Use prop notifications if provided, otherwise use context notifications
  const displayNotifications = propNotifications || notifications;
  
  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-4 h-4 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`;
    
    if (priority === 'high') {
      return <AlertTriangle className={`${iconClass} text-red-600 dark:text-red-400`} />;
    }
    
    switch (type) {
      case 'invoice':
        return <FileText className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      case 'expense':
        return <DollarSign className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'payroll':
        return <Users className={`${iconClass} text-purple-600 dark:text-purple-400`} />;
      case 'rate':
        return <DollarSign className={`${iconClass} text-orange-600 dark:text-orange-400`} />;
      default:
        return <AlertCircle className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />;
      default:
        return null;
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

  const filteredNotifications = displayNotifications
    .filter(notification => {
      if (filter === 'unread') return !notification.isRead;
      if (filter === 'high') return notification.priority === 'high';
      return true;
    })
    .slice(0, limit);

  const unreadCount = displayNotifications.filter(n => !n.isRead).length;
  const highPriorityCount = displayNotifications.filter(n => n.priority === 'high').length;

  if (compact) {
    return (
      <div className="space-y-2">
        {filteredNotifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
              !notification.isRead 
                ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            {getNotificationIcon(notification.type, notification.priority)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {notification.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getTimeAgo(notification.createdAt)}
              </p>
            </div>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0" />
            )}
          </div>
        ))}
        {displayNotifications.length > 3 && (
          <button className="w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-center py-1">
            View all {displayNotifications.length} notifications
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Notifications {filterPeriod && `(${filterPeriod})`}
            </h2>
          </div>
          {showActions && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { id: 'all', label: 'All', count: displayNotifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'high', label: 'High Priority', count: highPriorityCount }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'unread' | 'high')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                filter === tab.id
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  filter === tab.id
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'unread' ? 'No unread notifications' :
               filter === 'high' ? 'No high priority notifications' :
               'No notifications yet'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.priority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : notification.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/20'
                    : 'bg-blue-100 dark:bg-blue-900/20'
                }`}>
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </p>
                        {getPriorityIcon(notification.priority)}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeAgo(notification.createdAt)}</span>
                        </div>
                        
                        <span className="capitalize">
                          {notification.type} • {notification.priority} priority
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {showActions && (
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead ? (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Mark Read
                          </Button>
                        ) : (
                          <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Read
                          </span>
                        )}
                        
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {displayNotifications.length > limit && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            <span>View All Notifications ({displayNotifications.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentNotifications;