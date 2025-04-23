import { 
    Text, 
    View, 
    TouchableOpacity,
} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StoredAccount } from 'src/contexts/auth'
import styles from './style'

type AccountItemProps = { 
    account: StoredAccount
    onPress: () => void
    onLongPress: () => void 
}

const AccountItem = ({ 
    account, 
    onPress,
    onLongPress 
}: AccountItemProps) => {
    const getInitials = () => {
        if (account.firstName && account.lastName) {
            return `${account.firstName.charAt(0)}${account.lastName.charAt(0)}`.toUpperCase();
        }
        return account.username.charAt(0).toUpperCase();
    };

    const getDisplayName = () => {
        if (account.firstName && account.lastName) {
            return `${account.firstName} ${account.lastName}`;
        }
        return account.username;
    };

    return (
        <TouchableOpacity 
            style={styles.accountItem} 
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={500}
        >
            <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{getDisplayName()}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
    );
};

export default AccountItem; 