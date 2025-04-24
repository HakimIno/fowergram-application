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
  switchAccount: (accountId: number, onAccountSwitched?: () => void) => Promise<void>;
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
      const accounts = loadSavedAccounts();
      set({ accounts });

      // Check if there's an active account
      const activeAccountId = getActiveAccountId();

      if (activeAccountId) {
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        if (activeAccount && activeAccount.token) {


          try {
            const profileData = await getUserProfile(activeAccount.token, activeAccount.refresh_token);

            set({
              userDetails: profileData.user,
              jwt: activeAccount.token,
              isLoggedIn: true
            });

            const updatedAccount = {
              ...activeAccount,
              firstName: profileData.user.firstName || activeAccount.firstName,
              lastName: profileData.user.lastName || activeAccount.lastName,
              email: profileData.user.email,
              lastLogin: Date.now()
            };

            storeCredentials({
              token: activeAccount.token,
              refresh_token: activeAccount.refresh_token,
              user: profileData.user
            });

            set(state => ({
              accounts: state.accounts
                .map(acc => acc.id === activeAccountId ? updatedAccount : acc)
            }));

            return true;
          } catch (error) {
            console.error('Failed to fetch profile on startup:', error);
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

            return true;
          }
        } else {
          clearActiveAccountStorage();
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error loading accounts:', error);
      return false;
    }
  },

  // Login
  login: async (identifier: string, password: string) => {
    set({ isLoggingIn: true, loginError: undefined });

    try {
      const loginData: LoginUser = { identifier, password };
      const response = await login(loginData);

      if (response && response.data && response.data.token && response.data.user) {
        try {
          const profileData = await getUserProfile(response.data.token, response.data.refresh_token);

          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);

          set({
            userDetails: profileData.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          };
          storeCredentials(credentials);

          set({
            userDetails: response.data.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }

        get().loadAccounts();
      }
      else if (response && response.token) {
        try {
          const profileData = await getUserProfile(response.token);

          const credentials: Credentials = {
            token: response.token,
            refresh_token: response.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);

          set({
            userDetails: profileData.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });

          get().loadAccounts();
        } catch (profileError) {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
      }
      else if (response.status === "success" && response.data && response.data.token && response.data.user) {

        try {
          const profileData = await getUserProfile(response.data.token);

          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: profileData.user
          };
          storeCredentials(credentials);

          set({
            userDetails: profileData.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          console.error('Failed to fetch complete profile, using basic data:', profileError);
          const credentials: Credentials = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          };
          storeCredentials(credentials);

          set({
            userDetails: response.data.user,
            jwt: response.data.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }

        get().loadAccounts();
      }
      else {
        console.error('Unexpected response format:', JSON.stringify(response));
        throw new Error(`รูปแบบข้อมูลไม่ถูกต้อง`);
      }
    } catch (error: any) {
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

      const response = await register(data);

      if (response.status === 'success' && response.code === 'REGISTER_SUCCESS_NO_TOKEN') {
        set({
          isRegistering: false
        });

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

      if (response.status === 'success' && response.data && response.data.user && !response.data.token) {
        set({
          isRegistering: false
        });

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

      if (response && response.data && response.data.token && response.data.user) {
        const credentials: Credentials = {
          token: response.data.token,
          refresh_token: response.data.refresh_token,
          user: response.data.user
        };
        storeCredentials(credentials);

        set({
          jwt: response.data.token,
          userDetails: response.data.user,
          isLoggedIn: true,
          isRegistering: false
        });

        get().loadAccounts();

        if (onSuccess) onSuccess();
      }
      else if (response && response.token) {
        try {
          const profileData = await getUserProfile(response.token, response.refresh_token);

          const userData = profileData.user;

          if (userData) {
            const credentials: Credentials = {
              token: response.token!,
              refresh_token: response.refresh_token!,
              user: userData
            };
            storeCredentials(credentials);

            set({
              jwt: response.token,
              userDetails: userData,
              isLoggedIn: true,
              isRegistering: false
            });

            get().loadAccounts();

            if (onSuccess) onSuccess();
          }
        } catch (profileError) {
          console.error("Failed to get user profile after registration:", profileError);
          set({ isRegistering: false });

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
  switchAccount: async (accountId: number, onAccountSwitched?: () => void) => {
    const { accounts, jwt } = get();
    const account = accounts.find(acc => acc.id === accountId);

    if (!account) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบบัญชีที่เลือก');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    set({ isLoggingIn: true });

    try {
      if (!account.refresh_token) {
        console.warn('Missing refresh token for account', account.username);
        Alert.alert(
          'ไม่สามารถสลับบัญชีได้',
          'ต้องเข้าสู่ระบบด้วยรหัสผ่านใหม่ เนื่องจากเซสชันหมดอายุ',
          [{ text: 'ตกลง', style: 'default' }]
        );
        set({ isLoggingIn: false });
        return;
      }

      const switchRequest: SwitchAccountTokenRequest = {
        switch_type: 'token',
        identifier: account.username,
        stored_token: account.token || '',
        refresh_token: account.refresh_token
      };

      const currentJwt = jwt && jwt.trim().length > 0 ? jwt : '';

      const response = await apiSwitchAccount(currentJwt, switchRequest);

      if (response && response.token && response.user) {
        try {
          const profileData = await getUserProfile(response.token, response.refresh_token);

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
          set({
            userDetails: response.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });

          storeCredentials({
            user: response.user,
            token: response.token,
            refresh_token: response.refresh_token
          });
        }

        setActiveAccountStorage(account.id);

        const updatedAccount = {
          ...account,
          token: response.token,
          refresh_token: response.refresh_token,
          lastLogin: Date.now()
        };

        set(state => ({
          accounts: state.accounts
            .map(acc => acc.id === accountId ? updatedAccount : acc)
            .sort((a, b) => b.lastLogin - a.lastLogin)
        }));

        if (onAccountSwitched) {
          onAccountSwitched();
        }
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
      return get().login(identifier, password);
    }

    set({ isLoggingIn: true, loginError: undefined });

    try {
      const switchRequest: SwitchAccountPasswordRequest = {
        switch_type: 'password',
        identifier,
        password
      };

      const response = await apiSwitchAccount(jwt, switchRequest);

      if (response && response.token && response.user) {
        try {
          const profileData = await getUserProfile(response.token, response.refresh_token);

          storeCredentials({
            token: response.token,
            refresh_token: response.refresh_token,
            user: profileData.user
          });

          set({
            userDetails: profileData.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        } catch (profileError) {
          storeCredentials({
            token: response.token,
            refresh_token: response.refresh_token,
            user: response.user
          });

          set({
            userDetails: response.user,
            jwt: response.token,
            isLoggedIn: true,
            isLoggingIn: false
          });
        }

        get().loadAccounts();

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error(`รูปแบบข้อมูลไม่ถูกต้อง`);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      set({
        isLoggingIn: false,
        loginError: errorMessage
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  refreshUserProfile: async () => {
    const { jwt, userDetails } = get();

    if (!jwt) {
      console.warn('User is not logged in, cannot refresh profile');
      return;
    }

    try {
      const activeAccountId = getActiveAccountId();
      let refreshToken: string | undefined;

      if (activeAccountId) {
        const accounts = loadSavedAccounts();
        const activeAccount = accounts.find(acc => acc.id === activeAccountId);
        refreshToken = activeAccount?.refresh_token;
      }

      const profileData = await getUserProfile(jwt, refreshToken);

      if (profileData && profileData.user) {

        set({
          userDetails: profileData.user
        });

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
    }
  },
})); 