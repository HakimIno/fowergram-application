// Export main provider and hook
export { AuthProvider } from './provider';
export { useAuth } from './useAuth';

// Export types
export * from './types';

// Re-export storage utilities for direct access if needed
export {
  storage,
  loadSavedAccounts,
  getActiveAccountId,
  storeCredentials,
  removeAccountFromStorage,
  setActiveAccount,
  clearActiveAccount,
} from './storage'; 