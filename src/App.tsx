import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { BranchProvider } from './contexts/BranchContext';
import { RoleProvider } from './contexts/RoleContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/Auth/LoginForm';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import AccountingModule from './components/Accounting/AccountingModule';
import MarketModule from './components/Market/MarketModule';
import HRModule from './components/HR/HRModule';
import ReportsModule from './components/Reports/ReportsModule';
import SettingsModule from './components/Settings/SettingsModule';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounting':
        return <AccountingModule />;
      case 'market':
        return <MarketModule />;
      case 'hr':
        return user.permissions.some(p => p.name === 'hr.view') ? <HRModule /> : <Dashboard />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return user.permissions.some(p => p.name === 'settings.view') ? 
          <SettingsModule /> : 
          <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <BranchProvider>
              <RoleProvider>
                <DataProvider>
                  <AppContent />
                </DataProvider>
              </RoleProvider>
            </BranchProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;