import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAuthStore } from 'src/store/auth'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { useTheme } from 'src/context/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { LoginFormValues, validateForm } from './validation'
import { HelpLinks, LoginButton, LoginForm } from './components'
import styles from './style'
import { Ionicons } from '@expo/vector-icons'

export type LoginNavigationProp = StackNavigationProp<RootStackParamList, "login_screen">;

const LoginScreen = ({ navigation }: { navigation: LoginNavigationProp }) => {
    const { isLoggingIn, login, loginError } = useAuthStore();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    const [formState, setFormState] = useState<LoginFormValues>({
        identifier: '',
        password: '',
    });

    const [errors, setErrors] = useState<{
        identifier?: string;
        password?: string;
        form?: string;
    }>({});

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const validateFormBeforeSubmit = async (): Promise<boolean> => {
        try {
            const result = validateForm(formState);

            if (!result.success) {
                const validationErrors: { [key: string]: string } = {};
                result.error.errors.forEach(err => {
                    const path = err.path[0] as string;
                    validationErrors[path] = err.message;
                });

                setErrors(validationErrors);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Form validation error:', error);
            return false;
        }
    };

    const handleLogin = async () => {
        Keyboard.dismiss();

        const isValid = await validateFormBeforeSubmit();
        if (isValid) {
            login(formState.identifier, formState.password);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <LinearGradient
                colors={["#fff", '#fff', '#fff', "#eef2ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollViewContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerContainer}>
                            <StatusBar style="auto" />

                            <View style={[styles.logoContainer, { marginTop: insets.top + 15 }]}>
                                <Pressable
                                    onPress={() => navigation.goBack()}
                                    style={{ padding: 6, backgroundColor: 'rgba(177, 177, 177, 0.1)', borderRadius: 10 }}>
                                    <Ionicons name='arrow-back' size={24} />
                                </Pressable>
                                <Text style={styles.subtitleText}>เข้าสู่ระบบ</Text>
                            </View>
                            <View style={styles.accountContainer}>
                                <Text style={styles.titleText}>บัญชี</Text>
                            </View>

                            <LoginForm
                                formState={formState}
                                setFormState={setFormState}
                                errors={errors}
                                setErrors={setErrors}
                                loginError={loginError}
                            />

                            {/* <HelpLinks navigation={navigation} /> */}
                            <View style={styles.spacer} />
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>

                <LoginButton
                    onPress={handleLogin}
                    isLoggingIn={isLoggingIn}
                    position={{
                        bottom: keyboardVisible ? 10 : insets.bottom + 20,
                        left: 20,
                        right: 20
                    }}
                />
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen