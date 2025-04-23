import { Credentials, LoginUser, UserDetails, Jwt } from "src/interface";
import { RegisterData } from "src/api/Auth";

// Type for stored account
export interface StoredAccount {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  token: string;
  lastLogin: number;
}

// Auth context interface
export interface IAuthContext {
  userDetails?: UserDetails;
  jwt?: string;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  registerError?: string;
  loginError?: string;
  isActive: boolean;
  savedAccounts: StoredAccount[];
  onLogin: (loginUser: LoginUser) => void;
  onLogout: () => void;
  onRegister: (registerData: RegisterData, onSuccess?: () => void) => void;
  switchAccount: (accountId: number) => void;
  removeAccount: (accountId: number) => void;
}

// Storage keys
export const STORAGE_KEYS = {
  ACTIVE_ACCOUNT: 'active-account',
  ACCOUNTS_LIST: 'accounts-list',
  ACCOUNT_PREFIX: 'account-',
}; 