import { ActivityIndicator, Dimensions, GestureResponderEvent, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useContext, useRef, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthContext } from 'src/contexts/auth.context'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { useTheme } from 'src/context/ThemeContext'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import * as yup from 'yup'

const { width, height } = Dimensions.get("window")

export type RegisterNavigationProp = StackNavigationProp<RootStackParamList, "register_screen">;

// สร้าง validation schema ด้วย Yup
const registerSchema = yup.object().shape({
    username: yup
        .string()
        .required('กรุณากรอกชื่อผู้ใช้')
        .min(3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
        .matches(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข หรือ _ เท่านั้น'),
    email: yup
        .string()
        .required('กรุณากรอกอีเมล')
        .email('รูปแบบอีเมลไม่ถูกต้อง'),
    password: yup
        .string()
        .required('กรุณากรอกรหัสผ่าน')
        .min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
});

const RegisterScreen = ({ navigation }: { navigation: RegisterNavigationProp }) => {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    // State สำหรับเก็บค่า form
    const [formState, setFormState] = useState({
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

    const [showPassword, setShowPassword] = useState(false);
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

    // ฟังก์ชันเปลี่ยนแปลงค่าใน input
    const handleChange = (field: keyof typeof formState) => (text: string) => {
        setFormState(prev => ({ ...prev, [field]: text }));

        // ล้าง error เมื่อมีการพิมพ์ใหม่
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // ตรวจสอบ field เดียวเมื่อ blur
    const validateField = (field: keyof typeof formState) => async () => {
        try {
            // สร้าง schema สำหรับ field เดียว
            const fieldSchema = yup.object().shape({
                [field]: registerSchema.fields[field]
            });

            await fieldSchema.validate({ [field]: formState[field] }, { abortEarly: false });
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                // แสดง error แรกของ field นั้น
                const fieldError = error.inner.find(err => err.path === field);
                if (fieldError) {
                    setErrors(prev => ({ ...prev, [field]: fieldError.message }));
                    // สั่นเบาๆ เมื่อ validation ไม่ผ่าน
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
            }
        }
    };

    // ตรวจสอบทั้ง form เมื่อกดปุ่มถัดไป
    const validateForm = async (): Promise<boolean> => {
        try {
            await registerSchema.validate(formState, { abortEarly: false });
            return true;
        } catch (error) {
            if (error instanceof yup.ValidationError) {
                // รวบรวม error ทั้งหมด
                const validationErrors: { [key: string]: string } = {};
                error.inner.forEach(err => {
                    if (err.path) {
                        validationErrors[err.path] = err.message;
                    }
                });

                setErrors(validationErrors);
                // สั่นแรงเมื่อ form validation ไม่ผ่าน
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            return false;
        }
    };

    const handleNext = async () => {
        Keyboard.dismiss();

        const isValid = await validateForm();
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

                            <View style={styles.logoContainer}>
                                <FlowergramLogo
                                    width={200}
                                    height={70}
                                    fontSize={40}
                                    theme={{ textColor: "#000" }}
                                />
                                <Text style={styles.subtitleText}>สร้างบัญชีของคุณ</Text>
                            </View>

                            <View style={styles.formContainer}>
                                {/* Username Input */}
                                <View style={[
                                    styles.inputWrapper,
                                    errors.username ? styles.inputWrapperError : null
                                ]}>
                                    <MaterialCommunityIcons
                                        name="account-outline"
                                        size={20}
                                        color={errors.username ? "#ef4444" : "#6b7280"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: errors.username ? "rgba(255, 209, 209, 0.5)" : "rgba(229, 231, 235, 0.5)" }]}
                                        placeholder='ชื่อผู้ใช้'
                                        autoComplete="username"
                                        placeholderTextColor={'#a1a1aa'}
                                        value={formState.username}
                                        onChangeText={handleChange('username')}
                                        onBlur={validateField('username')}
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.username ? (
                                    <Text style={styles.errorText}>{errors.username}</Text>
                                ) : null}

                                {/* Email Input */}
                                <View style={[
                                    styles.inputWrapper,
                                    errors.email ? styles.inputWrapperError : null
                                ]}>
                                    <MaterialCommunityIcons
                                        name="email-outline"
                                        size={20}
                                        color={errors.email ? "#ef4444" : "#6b7280"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: errors.email ? "rgba(255, 209, 209, 0.5)" : "rgba(229, 231, 235, 0.5)" }]}
                                        placeholder='อีเมล'
                                        autoComplete="email"
                                        placeholderTextColor={'#a1a1aa'}
                                        value={formState.email}
                                        onChangeText={handleChange('email')}
                                        onBlur={validateField('email')}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email ? (
                                    <Text style={styles.errorText}>{errors.email}</Text>
                                ) : null}

                                {/* Password Input */}
                                <View style={[
                                    styles.inputWrapper,
                                    errors.password ? styles.inputWrapperError : null
                                ]}>
                                    <MaterialCommunityIcons
                                        name="lock-outline"
                                        size={20}
                                        color={errors.password ? "#ef4444" : "#6b7280"}
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 45, backgroundColor: errors.password ? "rgba(255, 209, 209, 0.5)" : "rgba(229, 231, 235, 0.5)" }]}
                                        placeholder='รหัสผ่าน'
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor={'#a1a1aa'}
                                        value={formState.password}
                                        onChangeText={handleChange('password')}
                                        onBlur={validateField('password')}
                                    />
                                    <Pressable
                                        style={styles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <MaterialCommunityIcons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color={errors.password ? "#ef4444" : "#6b7280"}
                                        />
                                    </Pressable>
                                </View>
                                {errors.password ? (
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                ) : null}
                            </View>
                            <View style={styles.helpLinksContainer}>
                                <Pressable onPress={handleLoginRedirect}>
                                    <Text style={styles.helpLinkText}>มีบัญชีอยู่แล้วใช่ไหม?</Text>
                                </Pressable>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100, // ให้มีพื้นที่ว่างด้านล่างเพื่อไม่ให้ปุ่มบัง
    },
    innerContainer: {
        flex: 1,
    },
    logoContainer: {
        height: height * 0.25,
        marginTop: height * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    subtitleText: {
        fontFamily: 'Chirp_Regular',
        color: '#6b7280',
        fontSize: 13,
        marginTop: 8,
        lineHeight: 13 * 1.4
    },
    formContainer: {
        alignItems: 'center',
        width: "100%",
        alignSelf: 'center',
        marginTop: 20,
        paddingHorizontal: 20
    },
    inputWrapper: {
        width: "100%",
        marginBottom: 16,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWrapperError: {
        marginBottom: 6, // ลด margin เมื่อมี error text อยู่ด้านล่าง
    },
    inputIcon: {
        position: 'absolute',
        left: 15,
        zIndex: 1,
    },
    passwordToggle: {
        position: 'absolute',
        right: 15,
        zIndex: 1,
    },
    textInfoSubTitle: {
        fontFamily: 'Chirp_Bold',
        fontSize: 14,
        lineHeight: 14 * 1.4
    },
    input: {
        flex: 1,
        paddingLeft: 45,
        textAlignVertical: 'center',
        fontFamily: 'Chirp_Regular',
        borderRadius: 16,
        height: 50,
    },
    btnContainer: {
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
       
    },
    spacer: {
        flex: 1,
    },
    helpLinksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 30
    },
    helpLinkText: {
        fontFamily: 'Chirp_Medium',
        fontSize: 12,
        marginTop: 16,
        lineHeight: 12 * 1.4
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: -4,
        marginBottom: 8,
        alignSelf: 'flex-start',
        paddingLeft: 4,
        fontFamily: 'Chirp_Regular',
        lineHeight: 12 * 1.4
    },
})