import { View, Text, Animated, Image, Platform, StyleSheet, StatusBar, TouchableOpacity, Easing } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Feather, Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'

import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomBarParamList } from 'src/navigation/types';
import { useAuthStore } from 'src/store/auth';


const isCheckPlatform = Platform.OS === 'ios';

const HEADER_HEIGHT_EXPANDED = 20;

const PROFILE_PICTURE_URI =
    'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/50183164/original/f80714a807d09df88dc708d83941384ac5d9e6dd/draw-nice-style-cartoon-caricature-as-a-profile-picture.png';

const sectionList = [
    {
        sectionHeaderTitle: "การตั้งค่าแอพ",
        listItem: [
            {
                icon: "person-sharp",
                lable: "บัญชี",
                route: "profile_screen",

            },

            {
                icon: "lock-open-sharp",
                lable: "เปลี่ยนรหัสพิน",
                route: "theme_screen",
            },
            {
                icon: "notifications-sharp",
                lable: "การแจ้งเตือน",
                route: "notification_screen",
            },
            {
                icon: "color-palette-sharp",
                lable: "ธีมและการตกแต่ง",
                route: "theme_screen",
            },
            {
                icon: "language",
                lable: "ภาษา",
                route: "language_screen",
            },
            {
                icon: "accessibility",
                lable: "การเข้าถึง",
                route: "theme_screen",
            },
        ]
    },
    {
        sectionHeaderTitle: "ความช่วยเหลือ",
        listItem: [
            {
                icon: "alert-sharp",
                lable: "พอปัญหาการใช้งาน",
                route: "theme_screen",
            },
            {
                icon: "call",
                lable: "สอบถามเพิ่มเติม",
                route: "theme_screen",
            },
            {
                icon: "alert-circle-sharp",
                lable: "เกิดขัดข้อง",
                route: "theme_screen",
            }
        ]
    },
    {
        sectionHeaderTitle: "ความช่วยเหลือ",
        listItem: [
            {
                icon: "alert-sharp",
                lable: "พอปัญหาการใช้งาน",
                route: "theme_screen",
            },
            {
                icon: "call",
                lable: "สอบถามเพิ่มเติม",
                route: "theme_screen",
            },
            {
                icon: "alert-circle-sharp",
                lable: "เกิดขัดข้อง",
                route: "theme_screen",
            }
        ]
    },
    {
        sectionHeaderTitle: "",
        listItem: [
            {
                icon: "log-out-sharp",
                lable: "ออกจากระบบ",
                route: "logout",
            },
        ]
    }

]

interface Route {
    screen: string;
    params?: any;
}

type SettingNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_account">;

const SettingScreen = () => {
    const navigation = useNavigation<SettingNavigationProp>()

    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    const imageStyle = {
        width: 70,
        height: 70,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'white',
        marginTop: 0,
        marginEnd: 15,
        transform: [
            {
                scale: scrollY.interpolate({
                    inputRange: [0, 50],
                    outputRange: [1, 0.6],
                    extrapolate: 'clamp',
                }),
            },
            {
                translateY: scrollY.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 20],
                    extrapolate: 'clamp',
                }),
            },
        ],
    }

    const { logout } = useAuthStore();

    const onPressNavigation = (route: Route) => {
        if (route.screen === "logout") {
            logout();
        } else {
            navigation.navigate(route.screen as any);
        }
    };

    return (
        <SafeAreaProvider>
            <StatusBar
                backgroundColor="transparent"
                translucent
                barStyle={"light-content"}
            />

            <LinearGradient
                colors={['#000000', '#000000',]}
                start={{ y: 0, x: 0.5 }}
                end={{ y: 1, x: 1 }}
                style={[styles.container]}
            >

                {/* Refresh arrow */}
                <Animated.View
                    style={{
                        zIndex: 2,
                        position: 'absolute',
                        top: insets.top + 13,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                        opacity: scrollY.interpolate({
                            inputRange: [-20, 0],
                            outputRange: [1, 0],
                        }),
                        transform: [
                            {
                                rotate: scrollY.interpolate({
                                    inputRange: [-45, -35],
                                    outputRange: ['180deg', '0deg'],
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                    }}
                >
                    <Feather name="arrow-down" color="white" size={25} />
                </Animated.View>

                <Animated.View
                    style={{
                        zIndex: 2,
                        position: 'absolute',
                        top: isCheckPlatform ? insets.top : insets.top + 10,
                        left: 30,
                        right: 0,
                        alignItems: 'flex-start',
                        opacity: scrollY.interpolate({
                            inputRange: [90, 110],
                            outputRange: [0, 1],
                        }),
                        transform: [
                            {
                                translateY: scrollY.interpolate({
                                    inputRange: [90, 120],
                                    outputRange: [30, 0],
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={{
                                uri: PROFILE_PICTURE_URI,
                            }}
                            style={{
                                height: 40,
                                width: 40,
                                borderRadius: 25,
                                marginRight: 10,
                                marginEnd: 15,
                                borderWidth: 1,
                                borderColor: 'white'
                            }}
                        />
                        <Text style={[styles.text, styles.username, { width: "50%" }]} numberOfLines={1}>วรนรนท์ สุขภาพ</Text>
                    </View>
                </Animated.View>

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    marginTop: isCheckPlatform ? insets.top : insets.top + 10
                }}>
                    <View />
                    <Octicons name="bell-fill" size={24} color="white" />
                </View>
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    overScrollMode="never"
                    onScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    contentOffset: { y: scrollY },
                                },
                            },
                        ],
                        { useNativeDriver: true }
                    )}
                    style={{
                        zIndex: 3,
                        // marginTop: HEADER_HEIGHT_NARROWED,
                        paddingTop: HEADER_HEIGHT_EXPANDED,

                    }}
                >
                    <View style={[styles.container]}>
                        <View
                            style={[
                                styles.container,
                                {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    paddingHorizontal: 10,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 10,
                                    marginHorizontal: 10,
                                    borderRadius: 20
                                },
                            ]}
                        >

                            <TouchableOpacity 
                                activeOpacity={0.9}
                                onPress={() => onPressNavigation({ screen: "profile_screen" })}
                            >
                                <Animated.Image
                                    source={{
                                        uri: PROFILE_PICTURE_URI,
                                    }}
                                    style={imageStyle}
                                />
                            </TouchableOpacity>
                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', }}>
                                <Text
                                    numberOfLines={1}
                                    style={[
                                        styles.text,
                                        {
                                            fontSize: 18,
                                            color: 'white',
                                        },
                                    ]}
                                >
                                    วรนรนท์ สุขภาพ
                                </Text>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    borderWidth: 1,
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    borderColor: "rgba(255,255,255,0.3)",
                                    padding: 3,
                                    elevation: 5
                                }}>
                                    <MaterialIcons name="edit" size={18} color="white" />
                                    < Text
                                        style={
                                            [
                                                {
                                                    fontSize: 13,
                                                    marginVertical: 2,
                                                    color: 'white',
                                                    fontFamily: 'SukhumvitSet_Me'
                                                },
                                            ]}
                                    >
                                        แก้ไข
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {sectionList.map((item, index) => (
                        <View key={index}>
                            {
                                item.sectionHeaderTitle && (
                                    <Text
                                        style={[
                                            styles.text, {
                                                paddingTop: 20,
                                                paddingHorizontal: 20
                                            }]}>{item.sectionHeaderTitle}</Text>
                                )
                            }
                            < View
                                style={
                                    [
                                        styles.container,
                                        {
                                            marginTop: 10,
                                            marginHorizontal: 10,
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            padding: 5,
                                            borderRadius: 20,
                                        },
                                    ]} >

                                {
                                    item.listItem.map((list, index) => (
                                        <TouchableOpacity activeOpacity={0.7} onPress={() => onPressNavigation({ screen: list.route })} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, paddingVertical: 15, borderTopWidth: index === 0 ? 0 : 0.5, borderTopColor: "rgba(255,255,255,0.3)", alignItems: 'center' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {/* <Octicons name={list.icon as any} size={24} color={"white"} style={{ marginEnd: 20 }} /> */}
                                                <Ionicons name={list.icon as any} size={24} color={"white"} style={{ marginEnd: 15, }} />
                                                <Text style={[
                                                    styles.text,
                                                    {
                                                        fontSize: 13,
                                                    }]}>{list.lable}</Text>
                                            </View>
                                            {item.sectionHeaderTitle && (
                                                <MaterialIcons name="keyboard-arrow-right" size={24} color="white" />
                                            )}
                                        </TouchableOpacity>
                                    ))
                                }
                            </View>
                        </View>
                    ))}


                    <View style={{ paddingBottom: 50 }} />
                </Animated.ScrollView>
            </LinearGradient >
        </SafeAreaProvider >
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        color: 'white',
        fontFamily: 'SukhumvitSet_Bd'
    },
    username: {
        fontSize: 18,
    },
    tweetsCount: {
        fontSize: 13,
    },
    tweet: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0, 0, 0, 0.25)',
    },
    exploreBtn: {
        width: "94%",
        backgroundColor: '#F72585',
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20
    },
    exploreBtnTxt: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
})

export default SettingScreen