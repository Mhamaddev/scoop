import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useBranches } from '../../contexts/BranchContext';
import { 
  FileText, 
  DollarSign,
  TrendingUp,
  Calculator,
  Target,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Building
} from 'lucide-react';
import Button from '../Common/Button';
import Select from '../Common/Select';
import { apiService } from '../../services/api';
import { formatIQD, formatUSD, formatDualCurrency } from '../../utils/currency';
import { CurrencyTotal } from '../../types';

interface TotalsData {
  accounting: CurrencyTotal;
  sales: CurrencyTotal;
  profit: CurrencyTotal;
  expenses: CurrencyTotal;
}

const ReportsModule: React.FC = () => {
  const { t } = useLanguage();
  const { accountingBranches, marketBranches } = useBranches();
  
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // January 1st of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  
  const [totalsData, setTotalsData] = useState<TotalsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<{rate: number, date: string, isDefault: boolean} | null>(null);

  // Get all branches (accounting + market)
  const getAllBranches = () => {
    const allBranches = [
      ...accountingBranches.filter(branch => branch.isActive),
      ...marketBranches.filter(branch => branch.isActive)
    ];
    
    return [
      { id: 'all', name: 'All Branches', location: '' },
      ...allBranches
    ];
  };

  // Fetch exchange rate
  const fetchExchangeRate = async () => {
    try {
      const rate = await apiService.getLatestExchangeRate();
      setExchangeRate(rate);
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  // Debug function to check database data
  const debugDatabaseData = async () => {
    try {
      console.log('🔍 Starting debug request...');
      const response = await fetch('/api/dashboard/debug-data');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      console.log('📄 Raw response text:', text);
      
      const data = JSON.parse(text);
      console.log('🔍 Database Debug Data:', data);
      
      // Log detailed information
      console.log('📊 Profits count:', data.profits?.entries?.length || 0);
      console.log('📊 Expenses count:', data.expenses?.entries?.length || 0);
      console.log('💰 Profit totals:', data.profits?.totals);
      console.log('💰 Expense totals:', data.expenses?.totals);
      
      alert('Debug data logged to console. Check developer tools (F12) > Console tab');
    } catch (err) {
      console.error('❌ Error fetching debug data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Error: ${errorMessage}. Check console for details.`);
    }
  };

  // Fetch totals data
  const fetchTotals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getTotals({
        branchId: selectedBranch,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      setTotalsData(response);
      
    } catch (err) {
      console.error('Error fetching totals:', err);
      setError('Failed to fetch totals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchTotals();
    fetchExchangeRate();
  }, [selectedBranch, dateRange.startDate, dateRange.endDate]);

  const getTotalCards = () => {
    if (!totalsData) return [];

    return [
      {
        title: 'Accounting',
        data: totalsData.accounting,
        icon: Calculator,
        color: 'blue',
        description: 'Total from invoices'
      },
      {
        title: 'Sales',
        data: totalsData.sales,
        icon: TrendingUp,
        color: 'green',
        description: 'Total sales revenue'
      },
      {
        title: 'Profit',
        data: totalsData.profit,
        icon: Target,
        color: 'purple',
        description: 'Total profit earned'
      },
      {
        title: 'Expenses',
        data: totalsData.expenses,
        icon: DollarSign,
        color: 'red',
        description: 'Total expenses'
      }
    ];
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('reports')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Overview of totals for accounting, sales, profit, and expenses (Default: IQD)
          </p>
          {exchangeRate && (
            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
              <DollarSign className="w-3 h-3 mr-1" />
              Current Rate: 1 USD = {exchangeRate.rate.toLocaleString()} IQD
              {exchangeRate.isDefault && (
                <span className="ml-1 text-yellow-600 dark:text-yellow-400">(Default)</span>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={debugDatabaseData}
            variant="outline"
            className="flex items-center justify-center"
          >
            🔍 Debug
          </Button>
              <Button
            onClick={fetchExchangeRate}
                variant="outline"
            className="flex items-center justify-center"
              >
            <DollarSign className="w-4 h-4 mr-2" />
            Rate
              </Button>
              <Button
            onClick={fetchTotals}
            disabled={isLoading}
            className="flex items-center justify-center"
              >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
              </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-medium">Error</h4>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Filters
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Branch Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Building className="w-4 h-4 inline mr-1" />
              Branch
            </label>
            <Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full"
              options={getAllBranches().map((branch) => ({
                value: branch.id,
                label: `${branch.name}${branch.location ? ` - ${branch.location}` : ''}`
              }))}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
            type="date"
            value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
            type="date"
            value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        </div>
      </div>

      {/* Totals Cards */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading totals...</p>
            </div>
      ) : totalsData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {getTotalCards().map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = {
              blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
              green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
              purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
              red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            };

            return (
              <div
                key={index}
                className={`rounded-lg border p-6 ${colorClasses[card.color as keyof typeof colorClasses]}`}
              >
              <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium opacity-80">
                      {card.title}
                    </p>
                    
                    {/* Primary amount (IQD) */}
                    <p className="text-2xl font-bold mt-1">
                      {formatIQD(card.data.total_iqd)}
                    </p>
                    
                    {/* Secondary amount (USD) if exists */}
                    {card.data.total_usd > 0 && (
                      <p className="text-sm opacity-70 mt-1">
                        + {formatUSD(card.data.total_usd)}
                      </p>
                    )}
                    
                    <p className="text-xs opacity-70 mt-1">
                      {card.description}
                  </p>
                </div>
                  <IconComponent className="w-8 h-8 opacity-60" />
                </div>
              </div>
            );
          })}
                  </div>
                ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;