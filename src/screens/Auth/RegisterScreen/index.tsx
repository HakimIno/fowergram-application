import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { useTheme } from 'src/context/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { FormInput } from './components/FormInput'
import { PasswordInput } from './components/PasswordInput'
import { useAvailabilityCheck } from 'src/hooks/useAvailabilityCheck'
import { RegisterFormValues, validateForm, validateSingleField } from './validation'
import styles from './style'
import { Ionicons } from '@expo/vector-icons'

export type RegisterNavigationProp = StackNavigationProp<RootStackParamList, "register_screen">;

/**
 * RegisterScreen component for user registration
 */
const RegisterScreen = ({ navigation }: { navigation: RegisterNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    // State สำหรับเก็บค่า form
    const [formState, setFormState] = useState<RegisterFormValues>({
        username: '',
        email: '',
        password: '',
    });

    // State สำหรับเก็บ error แต่ละ field
    const [errors, setErrors] = useState<{
        username?: string;
        email?: string;
        password?: string;
        form?: string;
    }>({});

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    // ใช้ custom hook สำหรับตรวจสอบความพร้อมใช้งานของชื่อผู้ใช้และอีเมลแบบ real-time
    const {
        usernameAvailable,
        usernameLoading,
        usernameError,
        emailAvailable,
        emailLoading,
        emailError
    } = useAvailabilityCheck(formState.username, formState.email);

    // Keyboard listeners
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

    // Effect for real-time username availability checking
    useEffect(() => {
        if (formState.username.length >= 3) {
            if (usernameAvailable === false) {
                setErrors(prev => ({ ...prev, username: 'ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว' }));
                // ให้ haptic feedback เพื่อแจ้งเตือนว่ามีข้อผิดพลาด
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } else if (usernameAvailable === true) {
                // ถ้ามี error เกี่ยวกับ availability ให้ล้างออก
                if (errors.username === 'ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว') {
                    setErrors(prev => ({ ...prev, username: undefined }));
                }
            }
        }
    }, [usernameAvailable, formState.username, errors.username]);

    // Effect for real-time email availability checking
    useEffect(() => {
        if (formState.email.includes('@')) {
            if (emailAvailable === false) {
                setErrors(prev => ({ ...prev, email: 'อีเมลนี้ถูกใช้งานไปแล้ว' }));
                // ให้ haptic feedback เพื่อแจ้งเตือนว่ามีข้อผิดพลาด
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } else if (emailAvailable === true) {
                // ถ้ามี error เกี่ยวกับ availability ให้ล้างออก
                if (errors.email === 'อีเมลนี้ถูกใช้งานไปแล้ว') {
                    setErrors(prev => ({ ...prev, email: undefined }));
                }
            }
        }
    }, [emailAvailable, formState.email, errors.email]);

    // ฟังก์ชันเปลี่ยนแปลงค่าใน input
    const handleChange = (field: keyof RegisterFormValues) => (text: string) => {
        setFormState(prev => ({ ...prev, [field]: text }));

        // ล้าง error เมื่อมีการพิมพ์ใหม่
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // ตรวจสอบ field เดียวเมื่อ blur
    const handleBlur = (field: keyof RegisterFormValues) => () => {
        try {
            // ใช้ฟังก์ชันที่แยกออกมาจากไฟล์ validation
            const result = validateSingleField(field, formState);

            if (!result.success) {
                // หา error ที่ตรงกับ field นี้
                const fieldError = result.error.errors.find(err => err.path[0] === field);
                if (fieldError) {
                    setErrors(prev => ({ ...prev, [field]: fieldError.message }));
                    // สั่นเบาๆ เมื่อ validation ไม่ผ่าน
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    return;
                }
            }

            // ตรวจสอบผลจาก API
            if (field === 'username' && usernameAvailable === false) {
                setErrors(prev => ({ ...prev, username: 'ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว' }));
                return;
            }

            if (field === 'email' && emailAvailable === false) {
                setErrors(prev => ({ ...prev, email: 'อีเมลนี้ถูกใช้งานไปแล้ว' }));
                return;
            }

            // ถ้าผ่านทุกการตรวจสอบให้ล้าง error
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error) {
            console.error('Validation error:', error);
        }
    };

    // ตรวจสอบทั้ง form เมื่อกดปุ่มถัดไป
    const validateFormBeforeSubmit = async (): Promise<boolean> => {
        // ใช้ฟังก์ชันที่แยกออกมาจากไฟล์ validation
        const result = validateForm(formState);

        if (!result.success) {
            // รวบรวม error ทั้งหมด
            const validationErrors: { [key: string]: string } = {};
            result.error.errors.forEach(err => {
                const path = err.path[0] as string;
                validationErrors[path] = err.message;
            });

            setErrors(validationErrors);
            // สั่นแรงเมื่อ form validation ไม่ผ่าน
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }

        // ตรวจสอบ availability จาก API
        if (usernameAvailable === false) {
            setErrors(prev => ({ ...prev, username: 'ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว' }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }

        if (emailAvailable === false) {
            setErrors(prev => ({ ...prev, email: 'อีเมลนี้ถูกใช้งานไปแล้ว' }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        }

        return true;
    };

    // จัดการปุ่มถัดไป
    const handleNext = async () => {
        Keyboard.dismiss();

        const isValid = await validateFormBeforeSubmit();
        if (isValid) {
            // Provide haptic feedback on successful validation
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Navigate to birthday screen with username, email and password
            navigation.navigate('register_birthday_screen', {
                username: formState.username,
                email: formState.email,
                password: formState.password
            });
        }
    };

    // นำไปหน้าเข้าสู่ระบบ
    const handleLoginRedirect = () => {
        navigation.navigate('login_screen');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            <LinearGradient
                colors={["#fff", '#fff', '#fff', "#fff"]}
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
                                <Text style={styles.subtitleText}>สร้างบัญชีของคุณ</Text>
                            </View>
                            <View style={styles.accountContainer}>
                                <Text style={styles.titleText}>บัญชี</Text>
                            </View>

                            <View style={styles.formContainer}>
                                {/* Username Input */}
                                <FormInput
                                    iconName="account-outline"
                                    placeholder="ชื่อผู้ใช้"
                                    autoComplete="username"
                                    value={formState.username}
                                    onChangeText={handleChange('username')}
                                    onBlur={handleBlur('username')}
                                    error={errors.username}
                                    loading={usernameLoading && formState.username.length >= 3}
                                    isValid={usernameAvailable === true && formState.username.length >= 3}
                                    showValidIcon={true}
                                />

                                {/* Email Input */}
                                <FormInput
                                    iconName="email-outline"
                                    placeholder="อีเมล"
                                    autoComplete="email"
                                    value={formState.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={handleBlur('email')}
                                    error={errors.email}
                                    loading={emailLoading && formState.email.includes('@')}
                                    isValid={emailAvailable === true && formState.email.includes('@')}
                                    showValidIcon={true}
                                    keyboardType="email-address"
                                />

                                {/* Password Input */}
                                <PasswordInput
                                    value={formState.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    error={errors.password}
                                    placeholder="รหัสผ่าน"
                                />
                            </View>
                            <View style={styles.spacer} />
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>

                {/* Next Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.btnContainer,
                        {
                            position: 'absolute',
                            bottom: keyboardVisible ? 10 : insets.bottom + 20,
                            left: 20,
                            right: 20,
                            opacity: pressed ? 0.9 : 1
                        }
                    ]}
                    onPress={handleNext}
                >
                    <Text style={[styles.textInfoSubTitle, { color: "white" }]}>ถัดไป</Text>
                </Pressable>
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen