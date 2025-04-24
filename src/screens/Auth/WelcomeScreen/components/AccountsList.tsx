import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { StoredAccount } from 'src/utils/auth';
import styles from '../style';
import AccountItem from './AccountItem';

type AccountsListProps = {
  accounts: StoredAccount[];
  onAccountPress: (account: StoredAccount) => void;
  onAccountLongPress: (account: StoredAccount) => void;
};

const AccountsList = ({
  accounts,
  onAccountPress,
  onAccountLongPress
}: AccountsListProps) => {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <View style={styles.savedAccountsContainer}>
      <Text style={styles.savedAccountsTitle}>
        บัญชีที่บันทึกไว้
      </Text>
      <View style={styles.accountsList}>
        {accounts.map((account) => (
          <AccountItem 
            key={account.id}
            account={account}
            onPress={() => onAccountPress(account)}
            onLongPress={() => onAccountLongPress(account)}
          />
        ))}
      </View>
    </View>
  );
};

export default AccountsList; 