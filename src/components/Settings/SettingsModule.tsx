import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, AlertTriangle, RotateCcw } from 'lucide-react';
import BranchManagement from './BranchManagement';
import RoleManagement from './RoleManagement';
import { apiService } from '../../services/api';

const SettingsModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('branches');
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetData = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }

    try {
      setIsResetting(true);
      await apiService.resetAllData();
      alert('✅ All business data has been reset successfully! The system is now ready for new data.');
      setShowResetConfirm(false);
      // Refresh the page to show empty state
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('❌ Failed to reset data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'branches':
        return <BranchManagement />;
      case 'roles':
        return user?.permissions.some(p => p.name === 'system.roles') ? 
          <RoleManagement /> : 
          <div className="text-center text-gray-500 py-8">Access denied</div>;
      case 'data':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-500" />
              Data Management
            </h3>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-red-800 dark:text-red-200 font-medium">Danger Zone</h4>
                  <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                    This action will permanently delete all business data including invoices, employees, sales, and branches. 
                    System users and permissions will be preserved.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Reset All Business Data</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Clear all invoices, branches, employees, sales, profits, expenses, and notifications. 
                  This will reset the system to a clean state for new business data.
                </p>
                
                {!showResetConfirm ? (
                  <button
                    onClick={handleResetData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    disabled={isResetting}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All Data
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Are you absolutely sure? This action cannot be undone!
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleResetData}
                        disabled={isResetting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isResetting ? 'Resetting...' : 'Yes, Reset Everything'}
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return <BranchManagement />;
    }
  };

  const tabs = [
    { id: 'branches', label: 'Branches', icon: '🏢' },
    ...(user?.permissions.some(p => p.name === 'system.roles') ? 
      [{ id: 'roles', label: 'Roles & Users', icon: '👥' }] : []),
    { id: 'data', label: 'Data Management', icon: '🗃️' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage system configuration and data</p>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md transition-colors text-sm font-medium flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
};

export default SettingsModule;