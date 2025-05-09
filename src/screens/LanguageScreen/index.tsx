import { StyleSheet, Text, Image, View } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import MainLayout from 'src/components/MainLayout'

type LanguageScreenNavigationProp = StackNavigationProp<RootStackParamList, "notification_screen">;

const LanguageScreen = () => {
    const navigation = useNavigation<LanguageScreenNavigationProp>();
    const insets = useSafeAreaInsets();

    const DATA = [
        {
            title: "English US",
            subTitle: "อังกฤษ (สหรััฐอเมริกา)",
            flag: "https://cdn3.iconfinder.com/data/icons/finalflags/256/United-States-Flag.png",
        },
        {
            title: "English UK",
            subTitle: "อังกฤษ (สหรราชอาณาจักร)",
            flag: "https://cdn3.iconfinder.com/data/icons/finalflags/256/United-Kingdom-flag.png",
        },
        {
            title: "ไทย",
            subTitle: "ไทย",
            flag: "https://cdn3.iconfinder.com/data/icons/finalflags/256/Thailand-Flag.png",
        },
        {
            title: "日本語",
            subTitle: "ญี่ปุ่น",
            flag: "https://cdn3.iconfinder.com/data/icons/finalflags/256/Japan-Flag.png",
        },
        {
            title: "中國人",
            subTitle: "จีน",
            flag: "https://cdn3.iconfinder.com/data/icons/finalflags/256/China-Flag.png",
        },

    ];


    return (
        <MainLayout titile='ภาษา' goBack={() => navigation.goBack()}>
            <FlashList
                showsVerticalScrollIndicator={false}
                data={DATA}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, paddingHorizontal: 15, borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.2)" }}>
                        <Image source={{ uri: item.flag }} style={{ width: 30, height: 30, marginEnd: 10, borderRadius: 3 }} />
                        <View>
                            <Text style={[{ fontSize: 13, fontFamily: 'Chirp_Bold', color: "#1a1a1a", lineHeight: 13 * 1.4 }]}>{item.title}</Text>
                            <Text style={[{ fontSize: 13, fontFamily: 'Chirp_Medium', color: "#1a1a1a", lineHeight: 13 * 1.4 }]}>{item.subTitle}</Text>
                        </View>
                    </View>
                )}
                estimatedItemSize={200}
            />
        </MainLayout>
    )
}

export default LanguageScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        fontFamily: 'Chirp_Medium',
        color: "#242424"
    },
})