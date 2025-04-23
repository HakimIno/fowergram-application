import React, { createContext, ReactNode, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from '@tanstack/react-query';
import { Credentials, LoginUser, UserDetails } from "src/interface";
import { httpEndpoint } from "../util/http";

export interface IAuthContext {
    userDetails?: UserDetails;
    jwt?: string;
    isLoggedIn: boolean;
    isLoggingIn: boolean;
    isActive: boolean;
    onLogin: (loginUser: LoginUser) => void;
    onLogout: () => void;
}

export const AuthContext = createContext<IAuthContext>({
    userDetails: undefined,
    jwt: undefined,
    isLoggedIn: false,
    isLoggingIn: false,
    isActive: false,
    onLogin: () => null,
    onLogout: () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const [jwt, setJwt] = useState<string>();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

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
        mutationFn: ({ email, password }: LoginUser) => httpEndpoint.post('v1/auth/login', { email, password })
            .then(response => response.data),
        onSuccess: (credentials: Credentials) => {
            setUserDetails(credentials.user);
            setJwt(credentials.token);
            setIsLoggedIn(true);
            setIsLoggingIn(false);
            _storeCredentials(credentials);
        },
        onError: (error: { message: any; }) => {
            console.error('Login failed:', error.message);
            setIsLoggingIn(false);
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
        setIsLoggedIn(true)
        // loginMutation.mutate(loginUser);
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
                isActive: isLoggedIn && appStateVisible === 'active',
                onLogin: loginHandler,
                onLogout: logoutHandler,
            }}>
            {children}
        </AuthContext.Provider>
    );
};
