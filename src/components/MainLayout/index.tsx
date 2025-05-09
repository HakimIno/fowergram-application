import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { ReactNode } from 'react'
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MainLayoutProps {
    titile: string;
    children: ReactNode;
    goBack?: () => void;
    iconRight?: {
        show: boolean,
        onPress: () => void;
    };
}

const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    titile,
    goBack,
    iconRight
}) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.container]} >
            <StatusBar style="auto" />
            <View style={[{
                paddingVertical: 15,
                borderBottomWidth: 0.5,
                borderBottomColor: '#e5e7eb',
                backgroundColor: 'white',
                zIndex: 2,

            }]}>
                <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: insets.top }}>
                    <Ionicons name="arrow-back" size={24} color={"#1a1a1a"} onPress={goBack} />
                    <View style={{ width: '70%' }}>
                        <Text style={[{ fontSize: 18, fontFamily: 'Chirp_Bold', color: "#1a1a1a" }]} numberOfLines={1} ellipsizeMode="tail">{titile}</Text>
                    </View>
                    {iconRight?.show ? (<Ionicons name="ellipsis-vertical" size={20} color="#1a1a1a" onPress={iconRight?.onPress} />) : <View style={{ width: 24, height: 24 }}></View>}
                </View>
            </View>
            {children}
        </View >
    )
}



export default MainLayout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    headerContainer: {
        backgroundColor: 'red',
        height: "10%",
        elevation: 2,
    },
    headerSubConatiner: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: 20,
    },
    iconContainer: {
        width: 26,
        height: 26,
        backgroundColor: 'white',
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 18,
        fontFamily: 'Chirp_Bold',
        color: "#1a1a1a",
    },
});