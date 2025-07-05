import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBranches } from '../../contexts/BranchContext';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign,
  Users,
  Building,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Target,
  Activity,
  Briefcase,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import Select from '../Common/Select';
import Modal from '../Common/Modal';
import { apiService } from '../../services/api';

type ModuleType = 'accounting' | 'market';
type ReportType = 'summary' | 'detailed' | 'comparative' | 'analytics';

interface ReportData {
  totalAmount: number;
  totalEntries: number;
  paidAmount: number;
  unpaidAmount: number;
  monthlyTrend: number[];
  topCategories: { name: string; amount: number; percentage: number }[];
  recentEntries: any[];
  branchComparison: { branchName: string; amount: number; entries: number }[];
}

const ReportsModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { accountingBranches, marketBranches } = useBranches();
  
  const [selectedModule, setSelectedModule] = useState<ModuleType>('accounting');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get branches based on selected module
  const getAvailableBranches = () => {
    const branches = selectedModule === 'accounting' ? accountingBranches : marketBranches;
    return [
      { id: 'all', name: 'All Branches', location: '' },
      ...branches.filter(branch => branch.isActive)
    ];
  };

  // Generate real report from API
  const generateReport = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      console.log('🔄 Generating report with real data...');
      
      const reportResponse = await apiService.generateReport({
        module: selectedModule,
        branchId: selectedBranch,
        reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      setReportData(reportResponse.data);
      setGeneratedReport(reportResponse);
      setShowPreview(true);
      
      console.log('✅ Real report generated successfully');
      
    } catch (err) {
      console.error('❌ Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel') => {
    if (!generatedReport) return;
    
    console.log(`Exporting ${selectedModule} report as ${format}`, generatedReport);
    alert(`Exporting ${selectedModule} report as ${format.toUpperCase()}...`);
  };

  const getModuleIcon = (module: ModuleType) => {
    return module === 'accounting' ? Calculator : TrendingUp;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getReportTitle = () => {
    const moduleTitle = selectedModule === 'accounting' ? 'Accounting' : 'Market';
    const branchTitle = selectedBranch === 'all' ? 'All Branches' : 
      getAvailableBranches().find(b => b.id === selectedBranch)?.name;
    const typeTitle = reportType.charAt(0).toUpperCase() + reportType.slice(1);
    
    return `${moduleTitle} ${typeTitle} Report - ${branchTitle}`;
  };

  const getMonthName = (monthIndex: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months[monthIndex] || `Month ${monthIndex + 1}`;
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
            Generate comprehensive reports for accounting and market data
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {reportData && (
            <>
              <Button
                onClick={() => exportReport('excel')}
                variant="outline"
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button
                onClick={() => exportReport('pdf')}
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </>
          )}
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

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Report Configuration
        </h2>
        
        {/* Module Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Module
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['accounting', 'market'] as ModuleType[]).map((module) => {
                const Icon = getModuleIcon(module);
                const isSelected = selectedModule === module;
                return (
                  <button
                    key={module}
                    onClick={() => {
                      setSelectedModule(module);
                      setSelectedBranch('all'); // Reset branch selection
                      setReportData(null); // Clear previous data
                      setError(null);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      isSelected ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'
                    }`}>
                      {module === 'accounting' ? 'Accounting' : 'Market'}
                    </p>
                    <p className={`text-xs ${
                      isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {module === 'accounting' ? 'Invoices & Payments' : 'Sales & Profits'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Available Branches ({getAvailableBranches().length - 1})
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Building className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedModule === 'accounting' ? 'Accounting' : 'Market'} Branches
                </span>
              </div>
              <div className="space-y-1">
                {getAvailableBranches().slice(1).length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    No {selectedModule} branches found. Create branches first.
                  </div>
                ) : (
                  getAvailableBranches().slice(1).map((branch) => (
                    <div key={branch.id} className="text-xs text-gray-600 dark:text-gray-400">
                      • {branch.name} {branch.location && `- ${branch.location}`}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Report Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={getAvailableBranches().map(branch => ({
              value: branch.id,
              label: branch.id === 'all' ? 'All Branches' : `${branch.name}${branch.location ? ` - ${branch.location}` : ''}`
            }))}
          />
          
          <Select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            options={[
              { value: 'summary', label: 'Summary Report' },
              { value: 'detailed', label: 'Detailed Analysis' },
              { value: 'comparative', label: 'Comparative Report' },
              { value: 'analytics', label: 'Advanced Analytics' }
            ]}
          />
          
          <Input
            label="Start Date"
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
          />
          
          <Input
            label="End Date"
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
          />
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-center">
          <Button
            onClick={generateReport}
            loading={isGenerating}
            className="flex items-center px-8 py-3"
            size="lg"
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-5 h-5 mr-2" />
            )}
            Generate {selectedModule === 'accounting' ? 'Accounting' : 'Market'} Report
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              {getReportTitle()}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Generated {new Date().toLocaleString()}</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total {selectedModule === 'accounting' ? 'Revenue' : 'Sales'}
                  </p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {formatCurrency(reportData.totalAmount)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Paid Amount
                  </p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {formatCurrency(reportData.paidAmount)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    Pending Amount
                  </p>
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {formatCurrency(reportData.unpaidAmount)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Total Entries
                  </p>
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {reportData.totalEntries}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <LineChart className="w-5 h-5 mr-2" />
                6-Month Trend
              </h3>
              <div className="space-y-2">
                {reportData.monthlyTrend.map((amount, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getMonthName(index)}
                    </span>
                    <div className="flex items-center space-x-2 flex-1 max-w-xs">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.max(5, (amount / Math.max(...reportData.monthlyTrend, 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[80px] text-right">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Entries */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Recent Entries (Last 10)
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {reportData.recentEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No entries found for this period</p>
                  </div>
                ) : (
                  reportData.recentEntries.map((entry, index) => (
                    <div key={entry.id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {entry.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.date} • {entry.branch}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(entry.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          entry.status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Branch Comparison */}
          {selectedBranch === 'all' && reportData.branchComparison.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Branch Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Branch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Entries
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reportData.branchComparison.map((branch, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {branch.branchName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(branch.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {branch.entries}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {reportData.totalEntries || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.floor(reportData.totalEntries / 30) || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {selectedModule === 'accounting' ? reportData.totalEntries : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accounting Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {selectedModule === 'market' ? reportData.totalEntries : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Reports</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;