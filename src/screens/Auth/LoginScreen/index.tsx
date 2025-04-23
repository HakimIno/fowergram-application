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

const { width, height } = Dimensions.get("window")

export type LoginNavigationProp = StackNavigationProp<RootStackParamList, "login_screen">;

const LoginScreen = ({ navigation }: { navigation: LoginNavigationProp }) => {
    const { isLoggingIn, onLogin } = useContext(AuthContext);

    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleLogin = () => {
        Keyboard.dismiss();
        onLogin({ email, password });
    };

    const { theme } = useTheme();

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

                            <View style={styles.logoContainer}>
                                <FlowergramLogo
                                    width={200}
                                    height={70}
                                    fontSize={40}
                                    theme={{ textColor: "#000" }}
                                />
                                <Text style={styles.subtitleText}>เข้าสู่ระบบ</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="account-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder='ชื่อผู้ใช้'
                                        autoComplete="username"
                                        placeholderTextColor={'#a1a1aa'}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="lock-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.input, { paddingRight: 50 }]}
                                        placeholder='รหัสผ่าน'
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor={'#a1a1aa'}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <Pressable
                                        style={styles.passwordToggle}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <MaterialCommunityIcons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color="#6b7280"
                                        />
                                    </Pressable>

                                </View>


                            </View>
                            <View style={styles.helpLinksContainer}>
                                <Pressable style={{}} onPress={() => navigation.navigate("register_screen")}>
                                    <Text style={styles.helpLinkText}>ยังไม่มีบัญชีใช่ไหม?</Text>
                                </Pressable>

                                <Pressable style={{}}>
                                    <Text style={[styles.helpLinkText, { color: "#4f46e5" }]}>ลืมรหัสผ่านเหรอ?</Text>
                                </Pressable>
                            </View>
                            <View style={styles.spacer} />
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>


                <Pressable
                    style={[
                        styles.btnContainer,
                        {
                            position: 'absolute',
                            bottom: keyboardVisible ? 10 : insets.bottom + 20,
                            left: 20,
                            right: 20
                        }
                    ]}
                    onPress={handleLogin}
                >
                    {!isLoggingIn ?
                        <Text style={[styles.textInfoSubTitle, { color: "white" }]}>เข้าสู่ระบบ</Text> :
                        <ActivityIndicator size={30} color={"white"} />}
                </Pressable>
            </LinearGradient>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen

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
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        fontFamily: 'Chirp_Regular',
        borderRadius: 16,
        height: 50,
        fontSize: 16,
    },
    btnContainer: {
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        shadowColor: "#4f46e5",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 10,
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
})