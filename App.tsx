import React, { useEffect } from 'react';
import Navigation from './src/navigation';
import { useFonts } from 'expo-font';
import { FORNTS } from "./src/constants/fonts"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { Host } from 'react-native-portalize';
import { AuthInitProvider } from './src/providers/AuthInitProvider';
import { StatusBar } from 'expo-status-bar';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SafeAreaView } from 'react-native';


const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

export default function App() {

  const [fontsLoaded] = useFonts({
    "Chirp_Bold": FORNTS.Chirp_Bold,
    "Chirp_Heavy": FORNTS.Chirp_Heavy,
    "Chirp_Medium": FORNTS.Chirp_Medium,
    "Chirp_Regular": FORNTS.Chirp_Regular
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1, width: '100%', height: '100%' }}>
        <QueryClientProvider client={queryClient}>
          <AuthInitProvider>
            <SafeAreaProvider>
              <Host>
                <Navigation />
              </Host>
              <StatusBar style="auto" />
            </SafeAreaProvider>
          </AuthInitProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}
