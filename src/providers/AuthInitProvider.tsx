import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from 'src/store/auth';
import * as SplashScreen from 'expo-splash-screen';

// ป้องกันไม่ให้ SplashScreen หายไปโดยอัตโนมัติ
SplashScreen.preventAutoHideAsync().catch(() => {
  /* เพิกเฉยข้อผิดพลาดในการป้องกัน auto hide */
});

interface AuthInitProviderProps {
  children: React.ReactNode;
}

/**
 * AuthInitProvider - Initialize authentication state when the app starts
 * This component doesn't provide a context, it just initializes the auth store
 */
export const AuthInitProvider: React.FC<AuthInitProviderProps> = ({ children }) => {
  const { loadAccounts } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await loadAccounts();
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        setIsReady(true);
      }
    };

    initAuth();
  }, [loadAccounts]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
}); 