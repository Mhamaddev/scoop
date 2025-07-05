import React from 'react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calculator, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  ChevronRight,
  Building2,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, show: true },
    { id: 'accounting', label: t('accounting'), icon: Calculator, show: true },
    { id: 'market', label: t('market'), icon: TrendingUp, show: true },
    { id: 'hr', label: t('hr'), icon: Users, show: user?.permissions?.some(p => p.name === 'hr.view') },
    { id: 'reports', label: t('reports'), icon: FileText, show: true },
    { id: 'settings', label: t('settings'), icon: Settings, show: user?.permissions?.some(p => p.name === 'settings.view') },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 
        transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Company Logo/Brand */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              AccountingPro
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role?.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 sm:py-4 overflow-y-auto">
        <div className="px-3 mb-2 hidden sm:block">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Main Menu
          </p>
        </div>
        {menuItems.map(item => 
          item.show && (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 mx-2 rounded-lg text-left transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                activeTab === item.id 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && (
                <ChevronRight className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400 hidden sm:block" />
              )}
            </button>
          )
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2025 AccountingPro
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;