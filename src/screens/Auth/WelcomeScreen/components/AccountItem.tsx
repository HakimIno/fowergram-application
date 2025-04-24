import {
    Text,
    View,
    TouchableOpacity,
} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { StoredAccount } from 'src/utils/auth'
import styles from '../style'
import UserAvatar from 'src/components/UserAvatar'

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
            <UserAvatar
                user={{
                    id: account.id,
                    username: account.username,
                    email: account.email,
                    firstName: account.firstName,
                    lastName: account.lastName,
                    profile_picture: account.profile_picture
                }}
                size={40}
            />
            <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{getDisplayName()}</Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
    );
};

export default AccountItem; 