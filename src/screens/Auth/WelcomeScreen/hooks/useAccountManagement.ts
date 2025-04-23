import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StoredAccount } from 'src/contexts/auth';
import { useAuthStore } from 'src/store/auth';

export const useAccountManagement = () => {
  const { accounts, switchAccount, removeAccount, loadAccounts } = useAuthStore();

  // Load accounts when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
      return () => {};
    }, [loadAccounts])
  );

  const handleAccountPress = (account: StoredAccount) => {
    switchAccount(account.id);
  };

  const handleAccountLongPress = (account: StoredAccount) => {
    removeAccount(account.id);
  };

  return {
    localAccounts: accounts,
    handleAccountPress,
    handleAccountLongPress
  };
}; 