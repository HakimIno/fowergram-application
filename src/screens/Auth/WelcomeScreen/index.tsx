import { StyleSheet, View, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { LinearGradient } from 'expo-linear-gradient'
import styles from './style'

// Components
import Logo from './components/Logo'
import AccountsList from './components/AccountsList'
import ButtonSection from './components/ButtonSection'
import Footer from './components/Footer'

// Hooks
import { useAccountManagement } from './hooks/useAccountManagement'
import { useWelcomeNavigation } from './hooks/useNavigation'

export type WelcomeNavigationProp = StackNavigationProp<RootStackParamList, "welcome_screen">;

const WelcomeScreen = ({ navigation }: { navigation: WelcomeNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const { localAccounts, handleAccountPress, handleAccountLongPress } = useAccountManagement();
    const { handleLoginPress, handleRegisterPress } = useWelcomeNavigation(navigation);

    // Debug only
    useEffect(() => {
        console.log('WelcomeScreen - localAccounts count:', localAccounts.length);
    }, [localAccounts]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#fff", '#fff', '#fff', "#fff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                <ScrollView showsVerticalScrollIndicator={false}>
                    <StatusBar style="auto" />

                    <Logo hasAccounts={localAccounts.length > 0} />

                    <AccountsList
                        accounts={localAccounts}
                        onAccountPress={handleAccountPress}
                        onAccountLongPress={handleAccountLongPress}
                    />



                </ScrollView>

                <Footer bottomPadding={insets.bottom } />
                <ButtonSection
                    hasAccounts={localAccounts.length > 0}
                    onLoginPress={handleLoginPress}
                    onRegisterPress={handleRegisterPress}
                />
            </LinearGradient>
        </View>
    );
};

export default WelcomeScreen;