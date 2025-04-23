import { useContext } from 'react';
import { AuthContext } from './provider';

/**
 * Custom hook to use the auth context
 * @returns Auth context values and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 