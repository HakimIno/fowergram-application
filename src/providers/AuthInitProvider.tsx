import React, { useEffect } from 'react';
import { useAuthStore } from 'src/store/auth';

interface AuthInitProviderProps {
  children: React.ReactNode;
}

/**
 * AuthInitProvider - Initialize authentication state when the app starts
 * This component doesn't provide a context, it just initializes the auth store
 */
export const AuthInitProvider: React.FC<AuthInitProviderProps> = ({ children }) => {
  const { loadAccounts } = useAuthStore();
  
  // Load accounts when the app starts
  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return <>{children}</>;
}; 