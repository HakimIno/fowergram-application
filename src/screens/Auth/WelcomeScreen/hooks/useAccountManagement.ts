import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StoredAccount } from 'src/utils/auth';
import { useAuthStore } from 'src/store/auth';

export const useAccountManagement = () => {
  const { 
    accounts, 
    switchAccount, 
    switchAccountWithPassword,
    removeAccount, 
    loadAccounts, 
    isLoggingIn,
    loginError 
  } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Load accounts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
      return () => {};
    }, [loadAccounts])
  );

  // Handle token-based account switching (stored accounts)
  const handleAccountPress = async (account: StoredAccount) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await switchAccount(account.id);
    } catch (err) {
      setError('ไม่สามารถสลับบัญชีได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account removal
  const handleAccountLongPress = (account: StoredAccount) => {
    removeAccount(account.id);
  };
  
  // Handle password-based account switching (for accounts not stored locally)
  const handlePasswordLogin = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      await switchAccountWithPassword(identifier, password);
    } catch (err) {
      setError('ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localAccounts: accounts,
    handleAccountPress,
    handleAccountLongPress,
    handlePasswordLogin,
    isLoading: isLoading || isLoggingIn,
    error: error || loginError
  };
}; 