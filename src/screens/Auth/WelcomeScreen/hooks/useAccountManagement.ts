import { useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth, StoredAccount } from 'src/contexts/auth';
import { getDisplayName } from '../utils';

export const useAccountManagement = () => {
  const { savedAccounts, switchAccount, removeAccount } = useAuth();
  const [localAccounts, setLocalAccounts] = useState<StoredAccount[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      setLocalAccounts(savedAccounts);
      console.log('WelcomeScreen - Using accounts from context:', savedAccounts.length, 'accounts');
      
      return () => {};
    }, [savedAccounts])
  );

  const handleAccountPress = (account: StoredAccount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switchAccount(account.id);
  };

  const handleAccountLongPress = (account: StoredAccount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'จัดการบัญชี',
      `คุณต้องการดำเนินการใดกับบัญชี ${getDisplayName(account)}`,
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบบัญชี',
          style: 'destructive',
          onPress: () => removeAccount(account.id),
        },
        {
          text: 'เข้าสู่ระบบ',
          onPress: () => switchAccount(account.id),
        },
      ]
    );
  };

  return {
    localAccounts,
    handleAccountPress,
    handleAccountLongPress
  };
}; 