import { Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, Vibration, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { Switch } from 'src/components/Switch'
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { useNavigation } from '@react-navigation/native'
import MainLayout from 'src/components/MainLayout'

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, "notification_screen">;


const NotificationScreen = () => {
    const navigation = useNavigation<NotificationScreenNavigationProp>();
    const insets = useSafeAreaInsets();

    const sectionList = [
        {
            sectionHeaderTitle: "การแจ้งเตือนภายใน",
            listItem: [
                {
                    lable: "การแจ้งเตือนภายในระบบ",
                    description: "",
                    onPress: () => { },
                },
            ]
        },
        {
            sectionHeaderTitle: "การแจ้งเตือนภายนอก",
            listItem: [
                {
                    lable: "การแจ้งเตือน Line",
                    description: "",
                    onPress: () => { },
                },
                {
                    lable: "การแจ้งเตือน SMS",
                    description: "",
                    onPress: () => { },
                },
                {
                    lable: "การแจ้งเตือน Mail",
                    description: "",
                    onPress: () => { },
                },
            ]
        },
    ]

    const [isActive, setIsActive] = useState(false)


    return (
        <MainLayout titile='แจ้งเตือน' goBack={() => navigation.goBack()}>
            {sectionList.map((item, index) => (
                <View key={index}>
                    {
                        item.sectionHeaderTitle && (
                            <Animated.Text
                                style={[
                                    styles.text, {
                                        paddingTop: 20,
                                        paddingHorizontal: 20,
                                        fontFamily: 'Chirp_Bold'
                                    }]}>{item.sectionHeaderTitle}
                            </Animated.Text>
                        )
                    }
                    <Animated.View
                        style={
                            [
                                {
                                    backgroundColor: "white",
                                    marginTop: 10,
                                    marginHorizontal: 10,
                                    paddingHorizontal: 10,
                                    borderRadius: 20,
                                },
                            ]} >

                        {
                            item.listItem.map((list, index) => (
                                <TouchableOpacity activeOpacity={0.7} onPress={list.onPress} key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 5, paddingVertical: 15, borderTopWidth: index === 0 ? 0 : 0.5, borderTopColor: "rgba(0,0,0,0.3)", alignItems: 'center' }}>
                                    <View style={{}}>
                                        <Animated.Text style={[
                                            styles.text,
                                            {

                                            }]}>{list.lable}</Animated.Text>
                                        {/* <Animated.Text style={[
                                            {
                                                fontSize: 13,
                                                fontFamily: 'Chirp_Medium'
                                            }]}>{list.description}</Animated.Text> */}
                                    </View>
                                    {list.description ? (
                                        <MaterialIcons name="keyboard-arrow-right" size={24} color={"#1a1a1a"} />
                                    ) : <Switch isActive={isActive} onPress={() => {
                                        setIsActive(!isActive)

                                    }} size={24} />}
                                </TouchableOpacity>
                            ))
                        }
                    </Animated.View>
                </View>
            ))}
        </MainLayout>


    )
}

export default NotificationScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontFamily: 'Chirp_Medium',
        color: "#242424"
    },
})