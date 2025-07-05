import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, AlertCircle } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: 'trending-up' | 'trending-down' | 'dollar' | 'users' | 'file' | 'alert';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon = 'trending-up',
  color = 'blue'
}) => {
  const icons = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'dollar': DollarSign,
    'users': Users,
    'file': FileText,
    'alert': AlertCircle
  };

  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
  };

  const IconComponent = icons[icon];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {changeType === 'positive' ? '+' : changeType === 'negative' ? '-' : ''}
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <IconComponent className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default DashboardWidget;