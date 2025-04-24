import { StoredAccount } from 'src/utils/auth';

export const getDisplayName = (account: StoredAccount): string => {
    if (account.firstName && account.lastName) {
        return `${account.firstName} ${account.lastName}`;
    }
    return account.username;
}; 