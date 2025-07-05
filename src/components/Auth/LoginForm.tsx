import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LogIn, Eye, EyeOff, Sun, Moon, Globe } from 'lucide-react';
import Button from '../Common/Button';
import Input from '../Common/Input';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);
    if (!success) {
      setError(t('loginError'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
          </button>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'ku' : 'en')}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              AccountingPro
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t('login')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label={t('username')}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('username')}
                required
              />

              <div className="relative">
                <Input
                  label={t('password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              {t('login')}
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <p className="text-green-600 dark:text-green-400 font-medium">✅ SQLite3 Database System</p>
              <p>Username: admin</p>
              <p>Password: password</p>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                🚀 Backend: Node.js + Express + SQLite3
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;