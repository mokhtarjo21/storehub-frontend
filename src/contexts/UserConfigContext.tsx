import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest, handleApiResponse } from '../utils/api';

interface UserConfig {
  account_status: string;
  allow_purchases: string;
  allow_affiliate: string;
  beta_features: string;
  max_order_value: string;
  daily_order_limit: string;
}

interface UserConfigContextType {
  userConfig: UserConfig | null;
  loading: boolean;
  isActive: boolean;
  isSuspended: boolean;
  isUnderReview: boolean;
  isBanned: boolean;
  canPurchase: boolean;
  canAffiliate: boolean;
  hasBetaFeatures: boolean;
  refetch: () => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserConfig = async () => {
    if (!isAuthenticated || !user) {
      setUserConfig(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiRequest('/auth/users/me/configurations/');
      const data = await handleApiResponse(response);
      setUserConfig(data);
    } catch (error) {
      console.error('Failed to fetch user configuration:', error);
      setUserConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserConfig();
  }, [user, isAuthenticated]);

  const isActive = userConfig?.account_status === 'active';
  const isSuspended = userConfig?.account_status === 'suspended';
  const isUnderReview = userConfig?.account_status === 'under_review';
  const isBanned = userConfig?.account_status === 'banned';
  const canPurchase = userConfig?.allow_purchases?.toLowerCase() === 'true';
  const canAffiliate = userConfig?.allow_affiliate?.toLowerCase() === 'true';
  const hasBetaFeatures = userConfig?.beta_features?.toLowerCase() === 'enabled';

  return (
    <UserConfigContext.Provider
      value={{
        userConfig,
        loading,
        isActive,
        isSuspended,
        isUnderReview,
        isBanned,
        canPurchase,
        canAffiliate,
        hasBetaFeatures,
        refetch: fetchUserConfig,
      }}
    >
      {children}
    </UserConfigContext.Provider>
  );
};

export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  if (context === undefined) {
    throw new Error('useUserConfig must be used within a UserConfigProvider');
  }
  return context;
};
