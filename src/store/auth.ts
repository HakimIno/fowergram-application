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
} from 'src/utils/auth';
import { 
  RegisterData, 
  login, 
  register,
  switchAccount as apiSwitchAccount,
  SwitchAccountTokenRequest,
  SwitchAccountPasswordRequest
} from 'src/api/Auth';
import { getUserProfile } from 'src/api/User';
import { getErrorMessage } from 'src/utils/errorHandler';

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
  loadAccounts: () => Promise<boolean>;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: RegisterData, onSuccess?: () => void) => Promise<void>;
  logout: () => void;
  removeAccount: (accountId: number) => void;
  switchAccount: (accountId: number) => Promise<void>;
  switchAccountWithPassword: (identifier: string, password: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
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
  loadAccounts: async () => {
    try {
      console.log('Loading saved accounts...');
      const accounts = loadSavedAccounts();
      console.log(`Found ${accounts.length} saved accounts`);
      set({ accounts });
      
      // Check if there's an active account
      const activeAccountId = getActiveAccountId();
      console.log('Active account ID:', activeAccountId);
      
      if (activeAccountId) {
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        if (activeAccount && activeAccount.token) {
          console.log(`Found active account: ${activeAccount.username}`);
          
          // Log if we have a refresh token for debug purposes
          if (activeAccount.refresh_token) {
            console.log('Active account has refresh token');
          } else {
            console.log('Active account does not have refresh token');
          }
          
          try {
            // ดึงข้อมูลล่าสุดจาก API
            console.log('Fetching fresh profile data on app start');
            const profileData = await getUserProfile(activeAccount.token, activeAccount.refresh_token);
            console.log('Loaded fresh profile data successfully');
            
            // อัปเดต state ด้วยข้อมูลล่าสุด
            set({
              userDetails: profileData.user,
              jwt: activeAccount.token,
              isLoggedIn: true
            });
            
            // อัปเดตข้อมูลใน storage
            const updatedAccount = {
              ...activeAccount,
              firstName: profileData.user.firstName || activeAccount.firstName,
              lastName: profileData.user.lastName || activeAccount.lastName,
              email: profileData.user.email,
              lastLogin: Date.now()
            };
            
            // อัปเดต storage
            storeCredentials({
              token: activeAccount.token,
              refresh_token: activeAccount.refresh_token,
              user: profileData.user
            });
            
            // อัปเดตรายการบัญชี
            set(state => ({
              accounts: state.accounts
                .map(acc => acc.id === activeAccountId ? updatedAccount : acc)
            }));
            
            return true; // ส่งคืนค่า true เมื่อโหลดสำเร็จและมีบัญชีที่ active
          } catch (error) {
            console.error('Failed to fetch profile on startup:', error);
            // ถ้าไม่สามารถดึงข้อมูลได้ ใช้ข้อมูลจาก storage
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
            
            return true; // ส่งคืนค่า true เมื่อโหลดสำเร็จแม้จะใช้ข้อมูลจาก storage
          }
        } else {
          // Clear active account if not found or no token
          console.log('Active account not found or has no token, clearing...');
          clearActiveAccountStorage();
          return false; // ส่งคืนค่า false เมื่อไม่พบบัญชีที่ active หรือไม่มี token
        }
      }
      
      return false; // ส่งคืนค่า false เมื่อไม่มีบัญชีที่ active
    } catch (error) {
      // Silent error handling
      console.error('Error loading accounts:', error);
      return false; // ส่งคืนค่า false เมื่อเกิดข้อผิดพลาด
    }
  },
  
  // Login
  login: async (identifier: string, password: string) => {
    set({ isLoggingIn: true, loginError: undefined });
    
    try {
      const loginData: LoginUser = { identifier, password };
      console.log('Attempting to login with:', identifier);
      const response = await login(loginData);
      
      console.log('Login response format:', Object.keys(response));
      
      // Handle the new API response format
      if (response && response.data && response.data.token && response.data.user) {
        console.log('Found valid data in response.data format');
        
        try {
          // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก API เพื่อให้ได้ข้อมูลครบถ้วน
          console.log('Fetching complete user profile data...');
          const profileData = await getUserProfile(response.data.token, response.data.refresh_token);
          
          // Store credentials with the complete user data
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);
          
          // Update state with complete user data
          set({
            userDetails: profileData.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          // Store credentials with the new format
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          };
          storeCredentials(credentials);
          
          // Update state with basic user data
          set({
            userDetails: response.data.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }
        
        // Reload accounts to include this one
        get().loadAccounts();
      }
      // Legacy format with direct token property
      else if (response && response.token) {
        console.log('Found valid data in legacy format');
        try {
          // Get user profile
          const profileData = await getUserProfile(response.token);
          
          // Store credentials
          const credentials: Credentials = {
            token: response.token,
            refresh_token: response.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);
          
          // Update state
          set({
            userDetails: profileData.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
          
          // Reload accounts
          get().loadAccounts();
        } catch (profileError) {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
      } 
      // Handle the specific format from the curl example
      else if (response.status === "success" && response.data && response.data.token && response.data.user) {
        console.log('Found valid data in success/data format');
        
        try {
          // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก API เพื่อให้ได้ข้อมูลครบถ้วน
          console.log('Fetching complete user profile data...');
          const profileData = await getUserProfile(response.data.token);
          
          // Store credentials with complete user data
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);
          
          // Update state with complete user data
          set({
            userDetails: profileData.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          // Store credentials with basic user data
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          };
          storeCredentials(credentials);
          
          // Update state with basic user data
          set({
            userDetails: response.data.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }
        
        // Reload accounts
        get().loadAccounts();
      }
      else {
        console.error('Unexpected response format:', JSON.stringify(response));
        throw new Error(`รูปแบบข้อมูลไม่ถูกต้อง`);
      }
    } catch (error: any) {
      // Extract error message for user display
      const errorMessage = getErrorMessage(error);
      console.error('Login error:', error, errorMessage);
      
      set({
        isLoggingIn: false,
        loginError: errorMessage
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  
  // Register
  register: async (data: RegisterData, onSuccess?: () => void) => {
    set({ isRegistering: true, registerError: undefined });
    
    try {
      console.log('Attempting to register with:', data.username);
      const response = await register(data);
      console.log('Registration response keys:', Object.keys(response));
      
      // Check for successful registration without auto-login
      if (response.status === 'success' && response.code === 'REGISTER_SUCCESS_NO_TOKEN') {
        console.log('Registration successful - user needs to login manually');
        set({
          isRegistering: false
        });
        
        // Show success message
        Alert.alert(
          'ลงทะเบียนสำเร็จ',
          'กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่ลงทะเบียน',
          [
            {
              text: 'ตกลง',
              onPress: () => {
                // เมื่อผู้ใช้กดตกลง ให้เรียก onSuccess callback
                if (onSuccess) onSuccess();
              }
            }
          ]
        );
        return;
      }
      
      // Check for format with user info but no token (common for new accounts that need email verification)
      if (response.status === 'success' && response.data && response.data.user && !response.data.token) {
        console.log('Registration successful with user data but no token - user needs to login manually');
        set({
          isRegistering: false
        });
        
        // Show success message
        Alert.alert(
          'ลงทะเบียนสำเร็จ',
          'กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่ลงทะเบียน',
          [
            {
              text: 'ตกลง',
              onPress: () => {
                if (onSuccess) onSuccess();
              }
            }
          ]
        );
        return;
      }
      
      // Check if we have data in the new format
      if (response && response.data && response.data.token && response.data.user) {
        console.log('Found valid data in response.data format');
        // Store credentials directly
        const credentials: Credentials = {
          token: response.data.token,
          refresh_token: response.data.refresh_token,
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
        console.log('Found valid data in legacy format');
        // Get user profile using token
        try {
          const profileData = await getUserProfile(response.token, response.refresh_token);
          
          // Since getUserProfile returns { user: UserDetails }, we get userData directly
          const userData = profileData.user;
          
          if (userData) {
            // Store credentials with non-null assertion for token
            const credentials: Credentials = {
              token: response.token!,
              refresh_token: response.refresh_token!,
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
          console.error("Failed to get user profile after registration:", profileError);
          set({ isRegistering: false });
          
          // Still call success as registration worked
          if (onSuccess) onSuccess();
        }
      } else {
        console.error('Unexpected registration response format:', JSON.stringify(response));
        throw new Error('รูปแบบข้อมูลการลงทะเบียนไม่ถูกต้อง');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Registration error:', errorMessage);
      set({
        isRegistering: false,
        registerError: errorMessage
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
  switchAccount: async (accountId: number) => {
    const { accounts, jwt } = get();
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบบัญชีที่เลือก');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set({ isLoggingIn: true });
    
    try {
      console.log('Attempting to switch to account:', account.username);
      
      // ใช้ token-based switching ทุกครั้ง
      const switchRequest: SwitchAccountTokenRequest = {
        switch_type: 'token',
        identifier: account.username,
        stored_token: account.token || '', // ส่ง empty string ถ้าไม่มี token
        refresh_token: account.refresh_token // ส่ง refresh token ไปด้วย
      };
      
      // ตรวจสอบ JWT ก่อนส่ง
      const currentJwt = jwt && jwt.trim().length > 0 ? jwt : '';
      console.log('Current JWT available:', !!currentJwt);
      
      // เรียกใช้ API switch-account ทุกครั้ง
      const response = await apiSwitchAccount(currentJwt, switchRequest);
      
      if (response && response.token && response.user) {
        try {
          // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก API เพื่อให้ได้ข้อมูลครบถ้วน
          console.log('Fetching complete user profile data...');
          const profileData = await getUserProfile(response.token, response.refresh_token);
          
          // อัปเดตสถานะด้วยข้อมูลผู้ใช้ที่สมบูรณ์
          set({
            userDetails: profileData.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
          
          // บันทึกข้อมูลที่สมบูรณ์
          storeCredentials({
            user: profileData.user,
            token: response.token,
            refresh_token: response.refresh_token
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          // หากไม่สามารถดึงข้อมูลเพิ่มเติมได้ ใช้ข้อมูลพื้นฐานที่ได้จาก switch account API
          set({
            userDetails: response.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
          
          // บันทึกข้อมูลพื้นฐาน
          storeCredentials({
            user: response.user,
            token: response.token,
            refresh_token: response.refresh_token
          });
        }
        
        // Set as active account in storage
        setActiveAccountStorage(account.id);
        
        // Update last login time
        const updatedAccount = {
          ...account,
          token: response.token, // Update with fresh token
          refresh_token: response.refresh_token, // Update with fresh refresh token
          lastLogin: Date.now()
        };
        
        // Update accounts list
        set(state => ({
          accounts: state.accounts
            .map(acc => acc.id === accountId ? updatedAccount : acc)
            .sort((a, b) => b.lastLogin - a.lastLogin)
        }));
      } else {
        throw new Error('ไม่พบข้อมูลที่ถูกต้องจาก API');
      }
    } catch (error) {
      console.error('Error switching account:', error);
      set({ isLoggingIn: false });
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปลี่ยนบัญชีได้ กรุณาลองใหม่อีกครั้ง');
    }
  },
  
  // Switch account with password
  switchAccountWithPassword: async (identifier: string, password: string) => {
    const { jwt } = get();
    
    if (!jwt) {
      // If not logged in, use normal login flow
      return get().login(identifier, password);
    }
    
    set({ isLoggingIn: true, loginError: undefined });
    
    try {
      // Create password-based switch request
      const switchRequest: SwitchAccountPasswordRequest = {
        switch_type: 'password',
        identifier,
        password
      };
      
      // Call switch account API
      const response = await apiSwitchAccount(jwt, switchRequest);
      
      if (response && response.token && response.user) {
        try {
          // ดึงข้อมูลผู้ใช้เพิ่มเติมจาก API เพื่อให้ได้ข้อมูลครบถ้วน
          console.log('Fetching complete user profile data...');
          const profileData = await getUserProfile(response.token, response.refresh_token);
          
          // Store credentials with complete user data
          storeCredentials({
            token: response.token,
            refresh_token: response.refresh_token,
            user: profileData.user
          });
          
          // Update state with complete user data
          set({
            userDetails: profileData.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          // Store credentials with basic user data
          storeCredentials({
            token: response.token,
            refresh_token: response.refresh_token,
            user: response.user
          });
          
          // Update state with basic user data
          set({
            userDetails: response.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }
        
        // Reload accounts to include this one
        get().loadAccounts();
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(`รูปแบบข้อมูลไม่ถูกต้อง`);
      }
    } catch (error: any) {
      // Extract error message for user display
      const errorMessage = getErrorMessage(error);
      
      set({
        isLoggingIn: false,
        loginError: errorMessage
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
  
  // Refresh user profile
  refreshUserProfile: async () => {
    const { jwt, userDetails } = get();
    
    if (!jwt) {
      console.warn('User is not logged in, cannot refresh profile');
      return;
    }
    
    try {
      // หา refresh token ของบัญชีที่ active อยู่
      const activeAccountId = getActiveAccountId();
      let refreshToken: string | undefined;
      
      if (activeAccountId) {
        const accounts = loadSavedAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        refreshToken = activeAccount?.refresh_token;
      }
      
      console.log('Refreshing user profile...');
      const profileData = await getUserProfile(jwt, refreshToken);
      
      if (profileData && profileData.user) {
        console.log('User profile refreshed successfully');
        
        // อัปเดต state
        set({
          userDetails: profileData.user
        });
        
        // อัปเดต storage
        if (userDetails) {
          storeCredentials({
            token: jwt,
            refresh_token: refreshToken,
            user: profileData.user
          });
        }
      } else {
        console.warn('User profile data is incomplete');
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // ถ้าเกิด error ในการเรียกใช้ getUserProfile ไม่ควร logout ทันที
      // อาจเกิดจากการขาดการเชื่อมต่อหรือปัญหาชั่วคราว
    }
  },
})); 