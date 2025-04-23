import React from 'react'
import Navigation from './src/navigation';
import { useFonts } from 'expo-font';
import { FORNTS } from "./src/constants/fonts"
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Knewave_400Regular } from '@expo-google-fonts/knewave';
import { PottaOne_400Regular } from '@expo-google-fonts/potta-one'
import { AuthProvider } from './src/contexts/auth'
import store from './src/redux-store';
import { ThemeProvider } from './src/context/ThemeContext';
import { Host } from 'react-native-portalize';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
})

export default function App() {
  const [fontsLoaded] = useFonts({
    "SukhumvitSet_Bd": FORNTS.SukhumvitSet_Bd,
    "SukhumvitSet_SM_Bd": FORNTS.SukhumvitSet_SM_Bd,
    "SukhumvitSet_Me": FORNTS.SukhumvitSet_Me,
    "SukhumvitSet_Li": FORNTS.SukhumvitSet_Li,
    "SukhumvitSet_SM": FORNTS.SukhumvitSet_SM_Bd,
    "Knewave_400Regular": Knewave_400Regular,
    "PottaOne_400Regular": PottaOne_400Regular,
    "Funnel_400Regular": FORNTS.Funnel_400Regular,
    "Funnel_600SemiBold": FORNTS.Funnel_600SemiBold,
    "Funnel_700Bold": FORNTS.Funnel_700Bold,

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
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <SafeAreaProvider>
                <Host>
                  <Navigation />
                </Host>
              </SafeAreaProvider>
            </AuthProvider>
          </QueryClientProvider>
        </Provider>
      </GestureHandlerRootView>
    </ThemeProvider>
  )
}
