import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
  
  // Load accounts when the app starts
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing auth and loading accounts...');
        // โหลดข้อมูลบัญชีและตรวจสอบสถานะการล็อกอิน
        await loadAccounts();
      } catch (error) {
        console.error('Error in auth initialization:', error);
      } finally {
        // แม้ว่าจะเกิดข้อผิดพลาด ให้ถือว่าพร้อมแสดงแอพแล้ว
        setIsReady(true);
      }
    };

    initAuth();
  }, [loadAccounts]);

  // callback สำหรับซ่อน SplashScreen เมื่อ UI พร้อมแสดงผล
  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      // ซ่อน SplashScreen เมื่อโหลดข้อมูลเสร็จสิ้น
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // ถ้ายังไม่พร้อม ให้แสดงเฉพาะ View ว่างๆ ที่มีการตั้ง onLayout
  if (!isReady) {
    return null;
  }

  // เมื่อพร้อมแล้ว ให้แสดง children components พร้อมกับตั้ง onLayout เพื่อซ่อน SplashScreen
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