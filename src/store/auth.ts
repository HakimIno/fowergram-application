import { create } from 'zustand';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { UserDetails, LoginUser, Jwt, Credentials } from 'src/interface';
import { 
  StoredAccount,
  loadSavedAccounts,
  removeAccountFromStorage,
  storeCredentials,
  setActiveAccount as setActiveAccountStorage,
  clearActiveAccount as clearActiveAccountStorage,
  getActiveAccountId,
  storage
} from 'src/contexts/auth';
import { RegisterData, login, register, getProfile } from 'src/api/Auth';

interface AuthState {
  // User data
  userDetails: UserDetails | undefined;
  jwt: string | undefined;
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  
  // Error states
  registerError: string | undefined;
  loginError: string | undefined;
  
  // Stored accounts
  accounts: StoredAccount[];
  
  // Actions
  loadAccounts: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  removeAccount: (accountId: number) => void;
  switchAccount: (accountId: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  userDetails: undefined,
  jwt: undefined,
  isLoggedIn: false,
  isLoggingIn: false,
  isRegistering: false,
  registerError: undefined,
  loginError: undefined,
  accounts: [],
  
  // Load stored accounts
  loadAccounts: () => {
    try {
      const accounts = loadSavedAccounts();
      set({ accounts });
      
      // Check if there's an active account
      const activeAccountId = getActiveAccountId();
      if (activeAccountId) {
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        if (activeAccount) {
          set({
            userDetails: {
              id: activeAccount.id,
              username: activeAccount.username,
              email: activeAccount.email,
              firstName: activeAccount.firstName,
              lastName: activeAccount.lastName,
            },
            jwt: activeAccount.token,
            isLoggedIn: true
          });
        } else {
          // Clear active account if not found
          clearActiveAccountStorage();
        }
      }
    } catch (error) {
      // Silent error handling
    }
  },
  
  // Login
  login: async (identifier: string, password: string) => {
    set({ isLoggingIn: true, loginError: undefined });
    
    try {
      const loginData: LoginUser = { identifier, password };
      const response = await login(loginData);
      
      // Based on the actual response format in our logs
      if (response && response.data && response.data.token && response.data.user) {
        // Store credentials
        const credentials: Credentials = {
          token: response.data.token,
          user: response.data.user
        };
        storeCredentials(credentials);
        
        // Update state
        set({
          userDetails: response.data.user,
          jwt: response.data.token,
          isLoggedIn: true,
          isLoggingIn: false
        });
        
        // Reload accounts to include this one
        get().loadAccounts();
      } else {
        throw new Error(`Invalid response format`);
      }
    } catch (error: any) {
      // Extract error message for user display
      let errorMessage = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      
      // If the response itself contains an error message
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      set({
        isLoggingIn: false,
        loginError: errorMessage
      });
    }
  },
  
  // Register
  register: async (data: RegisterData, onSuccess?: () => void) => {
    set({ isRegistering: true, registerError: undefined });
    
    try {
      const response = await register(data);
      
      // Check if we have data in the new format
      if (response && response.data && response.data.token && response.data.user) {
        // Store credentials directly
        const credentials: Credentials = {
          token: response.data.token,
          user: response.data.user
        };
        storeCredentials(credentials);
        
        // Update state
        set({
          jwt: response.data.token,
          userDetails: response.data.user,
          isLoggedIn: true,
          isRegistering: false
        });
        
        // Reload accounts
        get().loadAccounts();
        
        // Call success callback
        if (onSuccess) onSuccess();
      } 
      // Check for legacy format
      else if (response && response.token) {
        // Get user profile using token
        try {
          const profileData = await getProfile(response.token);
          
          let userData: UserDetails | undefined;
          
          if (profileData.data && profileData.data.user) {
            userData = profileData.data.user;
          } else if (profileData.user) {
            userData = profileData.user;
          } else if (profileData.id && profileData.username) {
            userData = profileData;
          }
          
          if (userData) {
            // Store credentials with non-null assertion for token
            const credentials: Credentials = {
              token: response.token!,
              user: userData
            };
            storeCredentials(credentials);
            
            // Update state
            set({
              jwt: response.token,
              userDetails: userData,
              isLoggedIn: true,
              isRegistering: false
            });
            
            // Reload accounts
            get().loadAccounts();
            
            // Call success callback
            if (onSuccess) onSuccess();
          }
        } catch (profileError) {
          set({ isRegistering: false });
          
          // Still call success as registration worked
          if (onSuccess) onSuccess();
        }
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      set({
        isRegistering: false,
        registerError: 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง'
      });
    }
  },
  
  // Logout
  logout: () => {
    // Show confirmation dialog
    Alert.alert(
      'ยืนยันการออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              // Clear active account from storage
              clearActiveAccountStorage();
              
              // Update state
              set({
                userDetails: undefined,
                jwt: undefined,
                isLoggedIn: false
              });
            } catch (error) {
              // Force logout even if there was an error
              set({
                userDetails: undefined,
                jwt: undefined,
                isLoggedIn: false
              });
            }
          },
        },
      ],
    );
  },
  
  // Remove account
  removeAccount: (accountId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'ยืนยันการลบบัญชี',
      'คุณต้องการลบบัญชีนี้ออกจากรายการที่จัดเก็บหรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: () => {
            // First update local state
            set(state => ({
              accounts: state.accounts.filter(acc => acc.id !== accountId)
            }));
            
            // Then update storage
            const success = removeAccountFromStorage(accountId);
            
            if (!success) {
              // If storage update failed, reload accounts
              get().loadAccounts();
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่อีกครั้ง');
              return;
            }
            
            // If this was the active account, log out
            const { userDetails } = get();
            if (userDetails?.id === accountId) {
              get().logout();
            }
          },
        },
      ],
    );
  },
  
  // Switch account
  switchAccount: (accountId: number) => {
    const { accounts } = get();
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบบัญชีที่เลือก');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Update current user details
    set({
      userDetails: {
        id: account.id,
        username: account.username,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
      },
      jwt: account.token,
      isLoggedIn: true
    });
    
    // Set as active account in storage
    setActiveAccountStorage(account.id);
    
    // Update last login time
    const updatedAccount = {
      ...account,
      lastLogin: Date.now()
    };
    
    // Update the account in storage with type assertion to ensure token is string
    storeCredentials({
      user: updatedAccount,
      token: account.token
    });
    
    // Update accounts list
    set(state => ({
      accounts: state.accounts
        .map(acc => acc.id === accountId ? updatedAccount : acc)
        .sort((a, b) => b.lastLogin - a.lastLogin)
    }));
  },
})); 