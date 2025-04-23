import React, { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { AppState, Alert } from "react-native";
import { Credentials, LoginUser, UserDetails, Jwt } from "src/interface";
import { RegisterData, register, getProfile } from "src/api/Auth";
import { IAuthContext, StoredAccount } from "./types";
import {
    clearActiveAccount,
    getActiveAccountId,
    loadSavedAccounts,
    removeAccountFromStorage,
    setActiveAccount,
    storeCredentials
} from "./storage";
import { useLoginMutation, useRegisterMutation } from "./hooks";

// Create the default context
export const AuthContext = createContext<IAuthContext>({
    userDetails: undefined,
    jwt: undefined,
    isLoggedIn: false,
    isLoggingIn: false,
    isRegistering: false,
    registerError: undefined,
    loginError: undefined,
    isActive: false,
    savedAccounts: [],
    onLogin: () => null,
    onLogout: () => null,
    onRegister: () => null,
    switchAccount: () => null,
    removeAccount: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // State
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const [jwt, setJwt] = useState<string>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<string>();
    const [loginError, setLoginError] = useState<string>();
    const [savedAccounts, setSavedAccounts] = useState<StoredAccount[]>([]);
    const [onRegisterSuccess, setOnRegisterSuccess] = useState<(() => void) | undefined>(undefined);

    // App state tracking
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    // Mutations
    const loginMutation = useLoginMutation(
        (credentials: Credentials) => {
            setUserDetails(credentials.user);
            setJwt(credentials.token);
            setIsLoggedIn(true);
            setIsLoggingIn(false);
        },
        (error: any, errorMsg: string) => {
            setIsLoggingIn(false);
            setLoginError(errorMsg);
        }
    );

    const registerMutation = useRegisterMutation(
        (data: Jwt) => {
            setJwt(data.token);
            setIsRegistering(false);
            setRegisterError(undefined);

            // เรียกใช้ API เพื่อดึงข้อมูลผู้ใช้หลังจากลงทะเบียนสำเร็จ
            const fetchUserProfile = async () => {
                try {
                    const profileData = await getProfile(data.token as string);

                    // รับข้อมูลที่ได้มาแล้วตรวจสอบความถูกต้อง
                    let userData: UserDetails | undefined;

                    if (profileData.data && profileData.data.user) {
                        // กรณีมี data wrapper
                        userData = profileData.data.user;
                    } else if (profileData.user) {
                        // กรณีไม่มี data wrapper
                        userData = profileData.user;
                    } else if (profileData.id && profileData.username) {
                        // กรณีข้อมูลผู้ใช้อยู่ใน response โดยตรง
                        userData = profileData;
                    }

                    if (userData) {
                        // สร้าง credentials object สำหรับเก็บข้อมูล
                        const credentials: Credentials = {
                            token: data.token as string,
                            user: userData
                        };

                        // บันทึกข้อมูลเข้าสู่ระบบ
                        setUserDetails(userData);
                        setIsLoggedIn(true);
                        storeCredentials(credentials);

                        console.log('User profile fetched and stored successfully');
                    } else {
                        console.error('Invalid user profile data format', profileData);
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile after registration:', error);
                    // แม้ไม่สามารถดึงโปรไฟล์ได้ เรายังคงให้การลงทะเบียนสำเร็จ
                    // ผู้ใช้ยังคงต้องเข้าสู่ระบบอีกครั้ง
                }
            };

            // ทำการดึงข้อมูลผู้ใช้
            fetchUserProfile();

            // Call the success callback if provided
            if (onRegisterSuccess) {
                onRegisterSuccess();
                setOnRegisterSuccess(undefined);
            }
        },
        (error: any, errorMsg: string) => {
            setIsRegistering(false);
            setRegisterError(errorMsg);
        }
    );

    // Effect for app state tracking
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Load saved accounts on app start
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load saved accounts and active account
    const loadInitialData = () => {
        try {
            // Load all accounts
            const accounts = loadSavedAccounts();
            console.log('Loaded accounts:', accounts.length);
            setSavedAccounts(accounts);

            // Load active account if available
            const activeAccountId = getActiveAccountId();
            if (activeAccountId !== undefined) {
                const activeAccount = accounts.find(acc => acc.id === activeAccountId);
                if (activeAccount) {
                    setUserDetails({
                        id: activeAccount.id,
                        username: activeAccount.username,
                        email: activeAccount.email,
                        firstName: activeAccount.firstName,
                        lastName: activeAccount.lastName,
                    });
                    setJwt(activeAccount.token);
                    setIsLoggedIn(true);
                } else {
                    // If active account not found in accounts list, clear active account
                    clearActiveAccount();
                    setIsLoggedIn(false);
                    setUserDetails(undefined);
                    setJwt(undefined);
                }
            }
        } catch (error) {
            console.error('Failed to load initial data:', error);
            // Reset state to prevent inconsistencies
            setSavedAccounts([]);
            setIsLoggedIn(false);
        }
    };

    // Login handler
    const loginHandler = (loginUser: LoginUser) => {
        setIsLoggingIn(true);
        loginMutation.mutate(loginUser);
    };

    // Register handler
    const registerHandler = (registerData: RegisterData, onSuccess?: () => void) => {
        setIsRegistering(true);
        setRegisterError(undefined);

        // Store the success callback
        if (onSuccess) {
            setOnRegisterSuccess(() => onSuccess);
        }

        registerMutation.mutate(registerData);
    };

    // Logout handler
    const logoutHandler = () => {
        setUserDetails(undefined);
        setJwt(undefined);
        setIsLoggedIn(false);

        // Remove active account marker but keep the account in storage
        clearActiveAccount();
    };

    // Switch account handler
    const switchAccountHandler = (accountId: number) => {
        try {
            const account = savedAccounts.find(acc => acc.id === accountId);
            if (!account) {
                Alert.alert('ข้อผิดพลาด', 'ไม่พบบัญชีที่เลือก');
                return;
            }

            // Update current user
            setUserDetails({
                id: account.id,
                username: account.username,
                email: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
            });
            setJwt(account.token);
            setIsLoggedIn(true);

            // Set as active account
            setActiveAccount(account.id);

            // Update last login time for this account
            const updatedAccount = {
                ...account,
                lastLogin: Date.now()
            };

            // Update the account in storage
            storeCredentials({
                user: updatedAccount,
                token: account.token
            });

            // Update the accounts list to reflect the new last login time
            setSavedAccounts(prevAccounts =>
                prevAccounts.map(acc => acc.id === accountId ? updatedAccount : acc)
                    .sort((a, b) => b.lastLogin - a.lastLogin)
            );

            console.log(`Switched to account: ${account.username} (${account.id})`);
        } catch (error) {
            console.error('Error switching accounts:', error);
            Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสลับบัญชีได้');
        }
    };

    // Remove account handler
    const removeAccountHandler = (accountId: number) => {
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
                        try {
                            // First update the local state immediately for UI responsiveness
                            setSavedAccounts(prevAccounts =>
                                prevAccounts.filter(acc => acc.id !== accountId)
                            );

                            // Then perform the storage operation
                            const success = removeAccountFromStorage(accountId);

                            if (!success) {
                                // If storage operation failed, revert the UI state
                                loadInitialData();
                                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบบัญชีได้ กรุณาลองใหม่อีกครั้ง');
                                return;
                            }

                            // If the removed account was the active one, log out
                            if (userDetails?.id === accountId) {
                                logoutHandler();
                            }

                            console.log(`Account ${accountId} removed successfully`);
                        } catch (error) {
                            console.error('Error removing account:', error);
                            Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการลบบัญชี');
                            // Reload the accounts to ensure UI consistency
                            loadInitialData();
                        }
                    },
                },
            ],
        );
    };

    return (
        <AuthContext.Provider
            value={{
                userDetails,
                jwt,
                isLoggedIn,
                isLoggingIn,
                isRegistering,
                registerError,
                loginError,
                isActive: isLoggedIn && appStateVisible === 'active',
                savedAccounts,
                onLogin: loginHandler,
                onLogout: logoutHandler,
                onRegister: registerHandler,
                switchAccount: switchAccountHandler,
                removeAccount: removeAccountHandler,
            }}>
            {children}
        </AuthContext.Provider>
    );
}; 