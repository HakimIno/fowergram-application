import { Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { Switch } from 'src/components/Switch'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BottomSheet, { BottomSheetMethods } from './components/BottomSheet'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { useNavigation } from '@react-navigation/native'

type ThemeScreenNavigationProp = StackNavigationProp<RootStackParamList, "theme_screen">;


const ThemeScreen = () => {
    const navigation = useNavigation<ThemeScreenNavigationProp>()
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetMethods>(null);

    const [theme, setTheme] = useState<string | null | undefined>(colorScheme);
    const [themeSwitch, setThemeSwitch] = useState<string>('system');

    const sectionList = [
        {
            sectionHeaderTitle: "ธีม",
            listItem: [
                {
                    lable: "ธีม",
                    description: "แบบสว่าง",
                    onPress: () => bottomSheetRef.current?.expand()
                },
                {
                    lable: "#",
                    description: "",
                    onPress: () => { }
                },
            ]
        },
    ]

    const [isActive, setIsActive] = useState(false)


    useEffect(() => {
        if (themeSwitch === 'system') {
            setTheme(colorScheme);
        }
    }, [colorScheme, themeSwitch]);

    const backgroundColorAnimation = useAnimatedStyle(() => {
        return {
            backgroundColor:
                theme === 'dark' ? withTiming('#242424') : withTiming('#f2f2f2'),
        };
    });



    const backgroundColorX = useAnimatedStyle(() => {
        return {
            backgroundColor:
                theme === 'dark' ? withTiming('#1a1a1a') : withTiming('white'),
        };
    });

    const textTheme = useAnimatedStyle(() => {
        return {
            color:
                theme === 'dark' ? withTiming('white') : withTiming('#1a1a1a'),
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                { paddingTop: insets.top },
                backgroundColorAnimation,
            ]}>
            <StatusBar style={theme === "dark" ? "light" : "dark"} />
            <Animated.View style={[{ paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.3)' }, backgroundColorAnimation]}>
                <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AntDesign name="arrowleft" size={26} color={theme === 'dark' ? "white" : "#1a1a1a"} onPress={() => navigation.goBack()} />
                    <Animated.Text style={[{ fontSize: 18, fontFamily: 'SukhumvitSet_Bd', color: "white" }, textTheme]}>ธีม</Animated.Text>
                    <View style={{ width: 24, height: 24 }}></View>
                </View>
            </Animated.View>
            {sectionList.map((item, index) => (
                <View key={index}>
                    {
                        item.sectionHeaderTitle && (
                            <Animated.Text
                                style={[
                                    styles.text, textTheme, {
                                        paddingTop: 20,
                                        paddingHorizontal: 20,
                                        fontFamily: 'SukhumvitSet_Me'
                                    }]}>{item.sectionHeaderTitle}
                            </Animated.Text>
                        )
                    }
                    <Animated.View
                        style={
                            [
                                backgroundColorX,
                                {
                                    marginTop: 10,
                                    marginHorizontal: 10,
                                    paddingHorizontal: 10,
                                    borderRadius: 20,
                                },
                            ]} >

                        {
                            item.listItem.map((list, index) => (
                                <TouchableOpacity activeOpacity={0.7} onPress={list.onPress} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, paddingTop: 15, borderTopWidth: index === 0 ? 0 : 0.5, borderTopColor: "rgba(0,0,0,0.3)", alignItems: 'center' }}>
                                    <View style={{}}>
                                        <Animated.Text style={[
                                            styles.text,
                                            textTheme,
                                            {

                                            }]}>{list.lable}</Animated.Text>
                                        <Animated.Text style={[
                                            textTheme,
                                            {
                                                fontSize: 13,
                                                fontFamily: 'SukhumvitSet_Me'
                                            }]}>{list.description}</Animated.Text>
                                    </View>
                                    {list.description ? (
                                        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme === 'dark' ? "white" : "#1a1a1a"} />
                                    ) : <Switch isActive={isActive} onPress={() => {
                                        setIsActive(!isActive)
                                        Vibration.vibrate(20)
                                    }} size={24} />}
                                </TouchableOpacity>
                            ))
                        }
                    </Animated.View>
                </View>
            ))}
            <BottomSheet
                ref={bottomSheetRef}
                setTheme={setTheme}
                theme={theme}
                setThemeSwitch={setThemeSwitch}
                themeSwitch={themeSwitch}
            />
        </Animated.View>
    )
}

export default ThemeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontFamily: 'SukhumvitSet_Bd'
    },
})