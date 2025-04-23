import { MMKV } from 'react-native-mmkv';
import { Credentials } from 'src/interface';
import { STORAGE_KEYS, StoredAccount } from './types';

// Setup secure storage with encryption
export const storage = new MMKV({
  id: 'auth-storage',
  encryptionKey: 'your-secure-app-key', // Replace with an actual encryption key in production
});

/**
 * Load all saved accounts from storage
 * @returns Array of stored accounts
 */
export const loadSavedAccounts = (): StoredAccount[] => {
  try {
    // Get list of saved accounts
    const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);
    const accountsList: number[] = accountsListJson ? JSON.parse(accountsListJson) : [];
    
    // Load details for each account
    const accounts: StoredAccount[] = [];
    accountsList.forEach(id => {
      const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${id}`;
      const accountJson = storage.getString(accountKey);
      if (accountJson) {
        const account: StoredAccount = JSON.parse(accountJson);
        accounts.push(account);
      }
    });
    
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
    
    const { user, token } = credentials;
    
    // Validate required user properties
    if (user.id === undefined || !user.email) {
      console.error('Cannot store credentials: user data is incomplete', user);
      return;
    }
    
    // Create stored account object
    const storedAccount: StoredAccount = {
      id: user.id,
      username: user.username || 'User',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
      lastLogin: Date.now(),
    };
    
    // Get current accounts list
    const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);
    let accountsList: number[] = accountsListJson ? JSON.parse(accountsListJson) : [];
    
    // Add current account to list if not already there
    if (!accountsList.includes(user.id)) {
      accountsList.push(user.id);
    }
    
    // Save the account details
    const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${user.id}`;
    storage.set(accountKey, JSON.stringify(storedAccount));
    
    // Update accounts list
    storage.set(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accountsList));
    
    // Set as active account
    storage.set(STORAGE_KEYS.ACTIVE_ACCOUNT, user.id);
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
    // Remove from accounts list
    const accountsListJson = storage.getString(STORAGE_KEYS.ACCOUNTS_LIST);
    if (accountsListJson) {
      let accountsList: number[] = JSON.parse(accountsListJson);
      accountsList = accountsList.filter(id => id !== accountId);
      storage.set(STORAGE_KEYS.ACCOUNTS_LIST, JSON.stringify(accountsList));
    }
    
    // Remove account storage
    const accountKey = `${STORAGE_KEYS.ACCOUNT_PREFIX}${accountId}`;
    storage.delete(accountKey);
    
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