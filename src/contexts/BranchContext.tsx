import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Branch } from '../types';
import { apiService } from '../services/api';

interface BranchContextType {
  accountingBranches: Branch[];
  marketBranches: Branch[];
  setAccountingBranches: (branches: Branch[]) => void;
  setMarketBranches: (branches: Branch[]) => void;
  addBranch: (branch: Omit<Branch, 'id' | 'createdAt'>) => Promise<void>;
  updateBranch: (branchId: string, updates: Partial<Branch>) => Promise<void>;
  deleteBranch: (branchId: string, moduleType: 'accounting' | 'market') => Promise<void>;
  toggleBranchStatus: (branchId: string, moduleType: 'accounting' | 'market') => Promise<void>;
  loading: boolean;
  refreshBranches: () => Promise<void>;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranches = () => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranches must be used within a BranchProvider');
  }
  return context;
};

interface BranchProviderProps {
  children: ReactNode;
}

export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const [accountingBranches, setAccountingBranches] = useState<Branch[]>([]);
  const [marketBranches, setMarketBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshBranches = async () => {
    try {
      setLoading(true);
      
      // Fetch accounting branches
      const accountingResponse = await apiService.getBranches('accounting');
      setAccountingBranches(accountingResponse.branches || []);
      
      // Fetch market branches
      const marketResponse = await apiService.getBranches('market');
      setMarketBranches(marketResponse.branches || []);
      
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBranches();
  }, []);

  const addBranch = async (branchData: Omit<Branch, 'id' | 'createdAt'>) => {
    try {
      await apiService.createBranch(branchData);
      await refreshBranches();
    } catch (error) {
      console.error('Error adding branch:', error);
      throw error;
    }
  };

  const updateBranch = async (branchId: string, updates: Partial<Branch>) => {
    try {
      await apiService.updateBranch(branchId, updates);
      await refreshBranches();
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  };

  const deleteBranch = async (branchId: string, moduleType: 'accounting' | 'market') => {
    try {
      await apiService.deleteBranch(branchId);
      await refreshBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  };

  const toggleBranchStatus = async (branchId: string, moduleType: 'accounting' | 'market') => {
    try {
      // Get current branch to determine new status
      const currentBranches = moduleType === 'accounting' ? accountingBranches : marketBranches;
      const branch = currentBranches.find(b => b.id === branchId);
      
      if (branch) {
        await apiService.updateBranch(branchId, { isActive: !branch.isActive });
        await refreshBranches();
      }
    } catch (error) {
      console.error('Error toggling branch status:', error);
      throw error;
    }
  };

  return (
    <BranchContext.Provider
      value={{
        accountingBranches,
        marketBranches,
        setAccountingBranches,
        setMarketBranches,
        addBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,
        loading,
        refreshBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};