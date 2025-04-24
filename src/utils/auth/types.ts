/**
 * Types for authentication and account management
 */

// Type for stored account
export interface StoredAccount {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  token: string;
  refresh_token?: string;
  lastLogin: number;
  profile_picture?: string;
}

// Storage keys
export const STORAGE_KEYS = {
  ACTIVE_ACCOUNT: 'active-account',
  ACCOUNTS_LIST: 'accounts-list',
  ACCOUNT_PREFIX: 'account-',
}; 