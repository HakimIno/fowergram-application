import React, { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { Credentials, LoginUser, UserDetails, Jwt } from "src/interface";
import { httpEndpoint } from "../util/http";
import { RegisterData, register } from "src/api/Auth";

export interface IAuthContext {
    userDetails?: UserDetails;
    jwt?: string;
    isLoggedIn: boolean;
    isLoggingIn: boolean;
    isRegistering: boolean;
    registerError?: string;
    loginError?: string;
    isActive: boolean;
    onLogin: (loginUser: LoginUser) => void;
    onLogout: () => void;
    onRegister: (registerData: RegisterData, onSuccess?: () => void) => void;
}

export const AuthContext = createContext<IAuthContext>({
    userDetails: undefined,
    jwt: undefined,
    isLoggedIn: false,
    isLoggingIn: false,
    isRegistering: false,
    registerError: undefined,
    loginError: undefined,
    isActive: false,
    onLogin: () => null,
    onLogout: () => null,
    onRegister: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const [jwt, setJwt] = useState<string>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [registerError, setRegisterError] = useState<string>();
    const [loginError, setLoginError] = useState<string>();
    const [onRegisterSuccess, setOnRegisterSuccess] = useState<(() => void) | undefined>(undefined);

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            appState.current = nextAppState;
            setAppStateVisible(appState.current);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    useEffect(() => {
        const fetchStoredCredentials = async () => {
            try {
                const storedCredentials = await AsyncStorage.getItem('credentials');
                if (storedCredentials) {
                    const parsedCredentials: Credentials = JSON.parse(storedCredentials);
                    setUserDetails(parsedCredentials.user);
                    setJwt(parsedCredentials.token);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error('Failed to fetch stored credentials:', error);
            }
        };

        fetchStoredCredentials();
    }, []);

    const loginMutation = useMutation<Credentials, { message: any; }, LoginUser>({
        mutationFn: (loginUser: LoginUser) => httpEndpoint.post('/api/v1/auth/login', loginUser)
            .then(response => response.data),
        onSuccess: (credentials: Credentials) => {
            setUserDetails(credentials.user);
            setJwt(credentials.token);
            setIsLoggedIn(true);
            setIsLoggingIn(false);
            _storeCredentials(credentials);
        },
        onError: (error: any) => {
            
            // จัดการกับข้อผิดพลาดต่างๆ ให้เป็นข้อความที่เข้าใจง่าย
            let errorMsg = 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง';
            
            // กรณี error จาก axios
            if (error.response) {
                // มีการตอบกลับจาก server พร้อมสถานะ error
                if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else {
                    switch (error.response.status) {
                        case 400:
                            errorMsg = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
                            break;
                        case 401:
                            errorMsg = 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง';
                            break;
                        case 404:
                            errorMsg = 'ไม่พบบริการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ';
                            break;
                        case 500:
                            errorMsg = 'เซิร์ฟเวอร์ผิดพลาด กรุณาลองใหม่ภายหลัง';
                            break;
                        default:
                            errorMsg = `เกิดข้อผิดพลาด (${error.response.status})`;
                    }
                }
            } else if (error.request) {
                // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
                errorMsg = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย';
            } else {
                // มีบางอย่างผิดพลาดในการตั้งค่าคำขอ
                errorMsg = error.message || errorMsg;
            }
            
            setIsLoggingIn(false);
            setLoginError(errorMsg);
        },
    });

    const registerMutation = useMutation<Jwt, { message: any; }, RegisterData>({
        mutationFn: register,
        onSuccess: (data: Jwt) => {
            setJwt(data.token);
            setIsRegistering(false);
            setRegisterError(undefined);
            
            // Call the success callback if provided
            if (onRegisterSuccess) {
                onRegisterSuccess();
                setOnRegisterSuccess(undefined);
            }
        },
        onError: (error: any) => {
            
            // จัดการกับข้อผิดพลาดต่างๆ ให้เป็นข้อความที่เข้าใจง่าย
            let errorMsg = 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง';
            
            // กรณี error จาก axios
            if (error.response) {
                // มีการตอบกลับจาก server พร้อมสถานะ error
                if (error.response.data && error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else {
                    switch (error.response.status) {
                        case 400:
                            errorMsg = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
                            break;
                        case 401:
                            errorMsg = 'ไม่มีสิทธิ์เข้าถึง กรุณาลองใหม่อีกครั้ง';
                            break;
                        case 404:
                            errorMsg = 'ไม่พบบริการลงทะเบียน กรุณาติดต่อผู้ดูแลระบบ';
                            break;
                        case 409:
                            errorMsg = 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น';
                            break;
                        case 500:
                            errorMsg = 'เซิร์ฟเวอร์ผิดพลาด กรุณาลองใหม่ภายหลัง';
                            break;
                        default:
                            errorMsg = `เกิดข้อผิดพลาด (${error.response.status})`;
                    }
                }
            } else if (error.request) {
                // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
                errorMsg = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย';
            } else {
                // มีบางอย่างผิดพลาดในการตั้งค่าคำขอ
                errorMsg = error.message || errorMsg;
            }
            
            setIsRegistering(false);
            setRegisterError(errorMsg);
        },
    });

    const _storeCredentials = async (credentials: Credentials) => {
        try {
            await AsyncStorage.setItem('credentials', JSON.stringify(credentials));
        } catch (error) {
            console.error('Failed to store credentials:', error);
        }
    };

    const loginHandler = (loginUser: LoginUser) => {
        setIsLoggingIn(true);
        loginMutation.mutate(loginUser);
    };

    const registerHandler = (registerData: RegisterData, onSuccess?: () => void) => {
        setIsRegistering(true);
        setRegisterError(undefined);
        
        // Store the success callback
        if (onSuccess) {
            setOnRegisterSuccess(() => onSuccess);
        }
        
        registerMutation.mutate(registerData);
    };

    const logoutHandler = async () => {
        setUserDetails(undefined);
        setJwt(undefined);
        setIsLoggedIn(false);
        try {
            await AsyncStorage.removeItem('credentials');
        } catch (error) {
            console.error('Failed to remove credentials:', error);
        }
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
                onLogin: loginHandler,
                onLogout: logoutHandler,
                onRegister: registerHandler,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
