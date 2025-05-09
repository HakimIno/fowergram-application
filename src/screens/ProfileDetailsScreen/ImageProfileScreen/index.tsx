import { Text, StyleSheet, Pressable, Image, View, Platform, Dimensions, useWindowDimensions, ImageBackground } from 'react-native';
import React, { useMemo } from 'react';
import Animated, { BounceInDown, } from 'react-native-reanimated';
import { RootStackParamList } from 'src/navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

import { BackdropBlur, BackdropFilter, ColorMatrix, rect, rrect, Skia } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
type ImageProfileNavigationProp = StackNavigationProp<RootStackParamList, "image_profile_screen">;

type Props = {
    navigation: ImageProfileNavigationProp
    route: RouteProp<RootStackParamList, "image_profile_screen">;
};


const ImageProfileScreen: React.FC<Props> = ({ navigation, route }) => {
    const { image, username } = route.params;

    return (
        <View style={styles.container}>

            <ImageBackground
                source={{ uri: image }}
                blurRadius={50}
                style={[styles.container, { opacity: 0.96, position: "relative" }]}
            >
                {/* Your content here */}
            </ImageBackground>

            <Pressable onPress={() => navigation.goBack()} style={{ width: "100%", height: '100%', position: "absolute", left: 0, right: 0, zIndex: 3 }} />
            <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 100 }}>
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                />
                <Animated.View
                    entering={BounceInDown.duration(400).delay(100)}
                    style={styles.card}
                >
                    <View style={styles.iconCard}>
                        <View style={styles.icon}>
                            <Ionicons name="share-outline" size={24} color="black" />
                        </View>
                        <Text style={styles.textCard}>แชร์โปรไฟล์</Text>
                    </View>
                    <View style={styles.iconCard}>
                        <View style={styles.icon}>
                            <Ionicons name="link" size={24} color="black" />
                        </View>
                        <Text style={styles.textCard}>คัดลอกลิงค์</Text>
                    </View>
                    <View style={styles.iconCard}>
                        <View style={styles.icon}>
                            <Ionicons name="qr-code-outline" size={24} color="black" />
                        </View>
                        <Text style={styles.textCard}>คิวอาร์โค้ด</Text>
                    </View>
                </Animated.View>
            </View>

        </View>
    )
}

export default ImageProfileScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
    },
    image: {
        width: "80%",
        aspectRatio: 1,
        borderRadius: 20,
    },
    text: {
        fontSize: 30,
        margin: 20,

    },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 20,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: "80%",
        paddingVertical: 15
    },
    iconCard: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginEnd: 15,
    },
    textCard: {
        fontSize: 12,
        fontFamily: 'Chirp_Medium',
        textAlign: 'center',
    },
    icon: {
        borderWidth: 1,
        borderColor: 'rgba(229, 231, 235, 1)',
        padding: 15,
        borderRadius: 100
    }
})