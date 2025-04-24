import { MMKV } from 'react-native-mmkv';
import { Credentials } from 'src/interface';
import { STORAGE_KEYS, StoredAccount } from './types';

// Setup secure storage with encryption
export const storage = new MMKV({
  id: 'auth-storage',
  encryptionKey: 'your-secure-app-key', // Replace with an actual encryption key in production
});

// Test storage is working
try {
  const testKey = 'test-storage-key';
  storage.set(testKey, 'test-value');
  const testValue = storage.getString(testKey);
  console.log('MMKV storage test:', testValue === 'test-value' ? 'PASSED' : 'FAILED');
  if (testValue !== 'test-value') {
    console.error('MMKV storage test failed! Expected "test-value", got:', testValue);
  }
} catch (error) {
  console.error('MMKV storage initialization error:', error);
}

/**
 * Load all saved accounts from storage
 * @returns Array of stored accounts
 */
export const loadSavedAccounts = (): StoredAccount[] => {
  try {
    // Get list of saved accounts
    const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);

    // If no accounts list, return empty array
    if (!accountsListJson) {
      return [];
    }

    let accountsList: number[] = [];
    try {
      accountsList = JSON.parse(accountsListJson);

      // Validate is array
      if (!Array.isArray(accountsList)) {
        console.error('Invalid accounts list format in storage');
        return [];
      }
    } catch (parseError) {
      console.error('Failed to parse accounts list from storage:', parseError);
      return [];
    }

    // Load details for each account
    const accounts: StoredAccount[] = [];
    for (const id of accountsList) {
      try {
        const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${id}`;
        const accountJson = storage.getString(accountKey);

        if (!accountJson) {
          console.warn(`Account ${id} not found in storage`);
          continue;
        }

        const account = JSON.parse(accountJson);

        // Validate required fields
        if (!account.id || !account.username || !account.email || !account.token) {
          console.warn(`Account ${id} has invalid format, skipping`);
          continue;
        }

        // Ensure lastLogin is a number
        if (typeof account.lastLogin !== 'number') {
          account.lastLogin = Date.now();
        }

        accounts.push(account);
      } catch (accountError) {
        console.error(`Error loading account ${id}:`, accountError);
      }
    }

    // Sort accounts by last login time (most recent first)
    return accounts.sort((a, b) => b.lastLogin - a.lastLogin);
  } catch (error) {
    console.error('Failed to load saved accounts:', error);
    return [];
  }
};

/**
 * Get active account ID from storage
 * @returns Active account ID or undefined if none
 */
export const getActiveAccountId = (): number | undefined => {
  return storage.getNumber(STORAGE_KEYS.ACTIVE_ACCOUNT);
};

/**
 * Store credentials for a user account
 * @param credentials User credentials to store
 */
export const storeCredentials = (credentials: Credentials): void => {
  try {
    // Check if credentials or user is undefined
    if (!credentials || !credentials.user) {
      console.error('Cannot store credentials: user data is undefined');
      return;
    }

    const { user, token, refresh_token } = credentials;

    // Validate required user properties
    if (user.id === undefined || !user.email) {
      console.error('Cannot store credentials: user data is incomplete', user);
      return;
    }

    const storedAccount: StoredAccount = {
      id: user.id,
      username: user.username || 'User',
      email: user.email,
      token: typeof token === 'string' ? token : '',
      refresh_token: typeof refresh_token === 'string' ? refresh_token : undefined,
      lastLogin: Date.now(),
      profile_picture: typeof user.profile_picture === 'string' ? user.profile_picture : undefined
    };

    if (!storedAccount.token) {
      console.error('Cannot store credentials: token is invalid');
      return;
    }

    try {
      const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);
      let accountsList: number[] = [];

      if (accountsListJson) {
        try {
          accountsList = JSON.parse(accountsListJson);
          if (!Array.isArray(accountsList)) {
            console.error('Invalid accounts list format, resetting');
            accountsList = [];
          }
        } catch (parseError) {
          console.error('Failed to parse accounts list, resetting', parseError);
          accountsList = [];
        }
      }

      if (!accountsList.includes(user.id)) {
        accountsList.push(user.id);
      }

      const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${user.id}`;
      storage.set(accountKey, JSON.stringify(storedAccount));

      storage.set(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accountsList));

      storage.set(STORAGE_KEYS.ACTIVE_ACCOUNT, user.id);


    } catch (storageError) {
      console.error('Error updating account list in storage:', storageError);
    }
  } catch (error) {
    console.error('Failed to store credentials:', error);
  }
};

/**
 * Remove account from storage
 * @param accountId ID of account to remove
 * @returns True if successful, false otherwise
 */
export const removeAccountFromStorage = (accountId: number): boolean => {
  try {
    // Get current active account
    const activeAccountId = getActiveAccountId();

    // Remove from accounts list
    const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);
    if (!accountsListJson) {
      console.warn('No accounts list found in storage');
      return false;
    }

    let accountsList: number[] = JSON.parse(accountsListJson);
    if (!accountsList.includes(accountId)) {
      console.warn(`Account ${accountId} not found in accounts list`);
      return false;
    }

    // Update accounts list
    accountsList = accountsList.filter(id => id !== accountId);
    storage.set(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accountsList));

    // Remove account storage
    const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${accountId}`;
    storage.delete(accountKey);

    // If this was the active account, clear active account
    if (activeAccountId === accountId) {
      clearActiveAccount();
    }

    console.log(`Account ${accountId} successfully removed from storage`);
    return true;
  } catch (error) {
    console.error('Failed to remove account:', error);
    return false;
  }
};

/**
 * Update active account in storage
 * @param accountId ID of account to set as active
 */
export const setActiveAccount = (accountId: number): void => {
  storage.set(STORAGE_KEYS.ACTIVE_ACCOUNT, accountId);
};

/**
 * Clear active account (logout)
 */
export const clearActiveAccount = (): void => {
  storage.delete(STORAGE_KEYS.ACTIVE_ACCOUNT);
}; 