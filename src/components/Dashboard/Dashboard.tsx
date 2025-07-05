import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import DashboardWidget from './DashboardWidget';
import RecentNotifications from './RecentNotifications';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle,
  Calendar,
  CreditCard,
  TrendingDown,
  Filter,
  CalendarDays,
  Clock,
  BarChart3
} from 'lucide-react';
import Select from '../Common/Select';
import Button from '../Common/Button';
import { apiService } from '../../services/api';

type FilterPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  const [dashboardData, setDashboardData] = useState({
    accounting: {
      total_invoices: 0,
      paid_invoices: 0,
      unpaid_invoices: 0,
      total_amount: 0,
      changes: {
        total_invoices: 0,
        paid_invoices: 0,
        unpaid_invoices: 0,
        total_amount: 0
      }
    },
    market: {
      total_sales: 0,
      total_profits: 0,
      total_expenses: 0,
      unpaid_expenses: 0,
      changes: {
        total_sales: 0,
        total_profits: 0,
        total_expenses: 0,
        unpaid_expenses: 0
      }
    },
    hr: {
      total_employees: 0,
      total_payroll: 0,
      changes: {
        total_employees: 0,
        total_payroll: 0
      }
    }
  });

  // Load dashboard data from API
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getDashboardStats({
        period: filterPeriod,
        date: selectedDate.toISOString()
      });
      setDashboardData(response);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filterPeriod, selectedDate]);

  const getDateRangeText = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: filterPeriod === 'yearly' ? 'numeric' : undefined
    };
    
    switch (filterPeriod) {
      case 'daily':
        return selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'weekly':
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
      case 'monthly':
        return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'yearly':
        return selectedDate.getFullYear().toString();
      default:
        return '';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (filterPeriod) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const resetToToday = () => {
    setSelectedDate(new Date());
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (value: number) => {
    return Number(value.toFixed(1));
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          {t('welcome')}, {user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-blue-100">
          {new Date().toLocaleDateString()} • {t('dashboard')}
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard Filters
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' }
                ]}
                className="min-w-32"
              />
              
              <Button
                onClick={resetToToday}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                Today
              </Button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigateDate('prev')}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              ←
            </Button>
            
            <div className="flex items-center space-x-2 min-w-0">
              <CalendarDays className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {getDateRangeText()}
              </span>
            </div>
            
            <Button
              onClick={() => navigateDate('next')}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              →
            </Button>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200">
                Showing {filterPeriod} data for {getDateRangeText()}
              </span>
            </div>
            {isLoading && (
              <span className="text-blue-600 dark:text-blue-400">Loading...</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Invoice Stats */}
        <DashboardWidget
          title={`${filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)} Invoices`}
          value={dashboardData.accounting.total_invoices}
          change={formatPercentage(dashboardData.accounting.changes.total_invoices)}
          changeType={dashboardData.accounting.changes.total_invoices >= 0 ? "positive" : "negative"}
          icon="file"
          color="blue"
        />
        
        <DashboardWidget
          title={t('paid')}
          value={dashboardData.accounting.paid_invoices}
          change={formatPercentage(dashboardData.accounting.changes.paid_invoices)}
          changeType={dashboardData.accounting.changes.paid_invoices >= 0 ? "positive" : "negative"}
          icon="trending-up"
          color="green"
        />
        
        <DashboardWidget
          title={t('unpaid')}
          value={dashboardData.accounting.unpaid_invoices}
          change={formatPercentage(dashboardData.accounting.changes.unpaid_invoices)}
          changeType={dashboardData.accounting.changes.unpaid_invoices >= 0 ? "negative" : "positive"}
          icon="trending-down"
          color="red"
        />

        {/* Market Stats */}
        <DashboardWidget
          title={`${filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)} Sales`}
          value={formatCurrency(dashboardData.market.total_sales)}
          change={formatPercentage(dashboardData.market.changes.total_sales)}
          changeType={dashboardData.market.changes.total_sales >= 0 ? "positive" : "negative"}
          icon="dollar"
          color="green"
        />
        
        <DashboardWidget
          title={`${filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)} Profits`}
          value={formatCurrency(dashboardData.market.total_profits)}
          change={formatPercentage(dashboardData.market.changes.total_profits)}
          changeType={dashboardData.market.changes.total_profits >= 0 ? "positive" : "negative"}
          icon="trending-up"
          color="indigo"
        />
        
        <DashboardWidget
          title={`${filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)} Expenses`}
          value={formatCurrency(dashboardData.market.total_expenses)}
          change={formatPercentage(dashboardData.market.changes.total_expenses)}
          changeType={dashboardData.market.changes.total_expenses >= 0 ? "negative" : "positive"}
          icon="trending-down"
          color="yellow"
        />
        
        <DashboardWidget
          title={t('unpaidExpenses')}
          value={formatCurrency(dashboardData.market.unpaid_expenses)}
          change={formatPercentage(dashboardData.market.changes.unpaid_expenses)}
          changeType={dashboardData.market.changes.unpaid_expenses >= 0 ? "negative" : "positive"}
          icon="alert"
          color="red"
        />

        {/* HR Stats */}
        <DashboardWidget
          title={t('employees')}
          value={dashboardData.hr.total_employees}
          change={formatPercentage(dashboardData.hr.changes.total_employees)}
          changeType={dashboardData.hr.changes.total_employees >= 0 ? "positive" : "negative"}
          icon="users"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Notifications */}
        <div className="lg:col-span-1">
          <RecentNotifications />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <FileText className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
              <span className="text-sm">New Invoice</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <DollarSign className="w-6 h-6 mb-2 text-green-600 dark:text-green-400" />
              <span className="text-sm">Record Sale</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Users className="w-6 h-6 mb-2 text-purple-600 dark:text-purple-400" />
              <span className="text-sm">Add Employee</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Calendar className="w-6 h-6 mb-2 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm">Schedule</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <CreditCard className="w-6 h-6 mb-2 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm">Expenses</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <BarChart3 className="w-6 h-6 mb-2 text-gray-600 dark:text-gray-400" />
              <span className="text-sm">Reports</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;