import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import FlowergramLogo from 'src/components/FlowergramLogo'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import styles from './style'

export type WelcomeNavigationProp = StackNavigationProp<RootStackParamList, "welcome_screen">;

const WelcomeScreen = ({ navigation }: { navigation: WelcomeNavigationProp }) => {
    const insets = useSafeAreaInsets();

    const handleLoginPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('login_screen');
    };

    const handleRegisterPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('register_screen');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#fff", '#fff', '#fff', "#eef2ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            >
                <StatusBar style="auto" />

                <View style={styles.logoContainer}>
                    <FlowergramLogo
                        width={250}
                        height={80}
                        fontSize={45}
                        theme={{ textColor: "#000" }}
                    />
                    <Text style={styles.subtitleText}>Hi ?</Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLoginPress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegisterPress}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>สร้างบัญชีใหม่</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
                    <Text style={styles.footerText}>
                        เมื่อดำเนินการต่อ คุณยอมรับนโยบายความเป็นส่วนตัว
                    </Text>
                    <Text style={styles.footerText}>
                        และข้อกำหนดการใช้งานของเรา
                    </Text>
                </View>
            </LinearGradient>
        </View>
    )
}

export default WelcomeScreen 