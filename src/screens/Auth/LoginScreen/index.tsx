import { ActivityIndicator, Dimensions, GestureResponderEvent, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Fontisto, Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet'
import { RootStackParamList } from 'src/navigation/types'
import { StackNavigationProp } from '@react-navigation/stack'
import { AuthContext } from 'src/contexts/auth.context'

const { width, height } = Dimensions.get("window")

export type LoginNavigationProp = StackNavigationProp<RootStackParamList, "login_screen">;

const LoginScreen = ({ navigation }: { navigation: LoginNavigationProp }) => {
    const { isLoggingIn, onLogin } = useContext(AuthContext);

    const bottomSheetRef = useRef<BottomSheetMethods>(null);
    const insets = useSafeAreaInsets();

    const listLogin = [
        { title: "Google", icon: "google", onPress: () => { } },
        { title: "Facebook", icon: "facebook", onPress: () => { } },
        { title: "Line", icon: "line", onPress: () => { } },
        { title: "Email", icon: "email", onPress: () => bottomSheetRef.current?.expand() }
    ]


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const resetForm = () => {
        setEmail('');
        setPassword('');
    };

    const start = 1900;
    const values = new Array(new Date().getFullYear() - start + 1)
        .fill(0)
        .map((_, i) => {
            const value = start + i;
            return { value, label: `${value}` };
        })
        .reverse();

    const defaultValue = 1990 - start;

    const handleLogin = () => {
        onLogin({ email, password });
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            {/* <LinearGradient
                // Background Linear Gradient
                colors={["#fff", '#a5f3fc', "#bae6fd",]}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
            > */}
            <View style={{ height: height * 0.3, marginTop: insets.top + height * 0.15, alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Knewave_400Regular', fontSize: 50 }}>Logo</Text>
                <Text style={{ fontFamily: 'SukhumvitSet_Me', color: '#6b7280' }}>สร้างบัญชีหรือเข้าสู่ระบบ</Text>
                <View style={{ alignItems: 'center', marginTop: height * 0.20 }}>
                    {listLogin?.map((item, index) => (
                        <TouchableOpacity
                            onPress={item.onPress}
                            key={index}
                            style={{
                                backgroundColor: "#f4f4f5",
                                padding: 14,
                                width: width * 0.9,
                                alignItems: 'center',
                                marginVertical: 10,
                                borderRadius: 40,
                                flexDirection: 'row',
                                elevation: 0.5,
                                justifyContent: 'space-between',
                                paddingHorizontal: 30
                            }}>
                            <Fontisto name={item.icon as "google" as "facebook" as "line"} size={24} color="black" />
                            <Text style={{ fontFamily: 'SukhumvitSet_Bd', textAlign: 'center' }}>ดำเนินการต่อด้วย {item?.title}</Text>
                            <View />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <BottomSheet ref={bottomSheetRef} handleClose={() => { }}>
                <Text style={[styles.textInfoSubTitle, { marginBottom: 15, fontSize: 20 }]} numberOfLines={1}>
                    เข้าสู่ระบบด้วย Email
                </Text>
                <View style={{ width: "100%" }}>
                    <TextInput
                        style={styles.input}
                        placeholder='Email'
                        autoComplete="email"
                        placeholderTextColor={'#a1a1aa'}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder='Password'
                        secureTextEntry
                        placeholderTextColor={'#a1a1aa'}
                        value={password}
                        onChangeText={setPassword}
                    />

                    <Pressable style={styles.btnContainer}
                        onPress={handleLogin}
                    >
                        {!isLoggingIn ?
                            <Text style={[styles.textInfoSubTitle, { color: "white" }]}>เข้าสู่ระบบ</Text> :
                            <ActivityIndicator size={30} color={"white"} />}

                    </Pressable>

                </View>
            </BottomSheet>
            {/* </LinearGradient> */}
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 300,
    },
    textInfoSubTitle: {
        fontSize: 17,
        fontFamily: 'SukhumvitSet_Bd'
    },
    input: {
        marginBottom: 20,
        padding: 15,
        textAlignVertical: 'center',
        backgroundColor: "rgba(229, 231, 235, 0.5)",
        fontFamily: 'SukhumvitSet_Bd',
        borderRadius: 20,
    },
    btnContainer: {
        borderWidth: 1,
        borderColor: "#84cc16",
        backgroundColor: '#1a1a1a',
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100
    },
})