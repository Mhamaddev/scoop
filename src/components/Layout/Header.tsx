import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import { Sun, Moon, Globe, LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                AccountingPro
              </h1>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ku' : 'en')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={language === 'en' ? t('kurdish') : t('english')}
            >
              <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role?.displayName}
                  </div>
                </div>
              </div>
              
              {/* Mobile user indicator */}
              <div className="sm:hidden w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                title={t('logout')}
              >
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;