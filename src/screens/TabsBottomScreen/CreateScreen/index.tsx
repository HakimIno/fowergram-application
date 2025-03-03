import { Dimensions, ListRenderItemInfo, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import Animated, { measure, runOnUI, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { useCreateScreen } from './hooks/useCreateScreen'
import { FlashList } from '@shopify/flash-list'
import AnimatedText from 'src/components/AnimatedText'
import TabScreen from './TabScreen'
import { useSelector } from 'react-redux'
import { RootState } from 'src/redux-store'

const { width, height } = Dimensions.get("window")

export type CreateNavigationProp = StackNavigationProp<RootStackParamList>

interface AlbumInfo {
    title: string
    url: string
    assetCount: number
}

interface RenderItemProps {
    item: AlbumInfo
    index: number
    handelSelectAlbums: (title: string, index: number) => void
    selectAlbums: { title: string; indx: number }
}

const Tab = createMaterialTopTabNavigator()

const Loading = () => (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ flex: 0.8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
            <AnimatedText text="Loading..." color="#fff" />
        </View>
    </View>
)

const MemoizedLoadingScreen = React.memo(Loading)
const MemoizedTabScreen = React.memo(TabScreen)

// Wrapper components for tab screens
const AllsTabScreen: React.FC = () => {
    const { loading, loadMore, allFiles } = useCreateScreen()
    return (
        <MemoizedTabScreen
            photos={allFiles}
            onLoadMore={loadMore}
            loading={loading}
        />
    )
}

const PhotosTabScreen: React.FC = () => {
    const { loading, loadMore, photos } = useCreateScreen()
    return (
        <MemoizedTabScreen
            photos={photos}
            onLoadMore={loadMore}
            loading={loading}
        />
    )
}

const VideosTabScreen: React.FC = () => {
    const { loading, loadMore, videos } = useCreateScreen()
    return (
        <MemoizedTabScreen
            photos={videos}
            onLoadMore={loadMore}
            loading={loading}
        />
    )
}

// RenderItem component
const RenderItem: React.FC<RenderItemProps> = ({ item, index, handelSelectAlbums, selectAlbums }) => {
    return (
        <Pressable
            style={styles.touchableOpacity}
            onPress={() => handelSelectAlbums(item.title, index)}
        >
            <View style={styles.rowContainer}>
                <Image
                    source={{ uri: item.url }}
                    style={styles.imageList}
                    contentFit="cover"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.textHeaderTitle} numberOfLines={1}>
                        {item.title === "Pictures" ? "แกลเลอรี" : item.title}
                    </Text>
                    <Text style={styles.assetCountText}>({item.assetCount})</Text>
                </View>
            </View>
            <Ionicons
                name={selectAlbums.indx === index ? "radio-button-on" : "radio-button-off"}
                size={26}
                color="white"
            />
        </Pressable>
    )
}

const CreateScreen: React.FC<{ navigation: CreateNavigationProp }> = ({ navigation }) => {
    const insets = useSafeAreaInsets()
    const listRef = useAnimatedRef<View>()
    const heightValue = useSharedValue(0)
    const open = useSharedValue(false)
    const progress = useDerivedValue(() =>
        open.value ? withTiming(1) : withTiming(0)
    )

    const { loading, loadMore, photos, videos, allFiles, albumsInfo, loadPhotos, selectAlbums, handelSelectAlbums } = useCreateScreen()
    const selectedPhotos = useSelector((state: RootState) => state.medias.selectedPhotos)



    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: heightValue.value,
    }))

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }],
    }))

    useEffect(() => {
        if (allFiles.length === 0) {
            loadPhotos()
        }
    }, [allFiles, loadPhotos])

    const handlePress = () => {
        runOnUI(() => {
            'worklet'
            if (heightValue.value === 0) {
                const measured = measure(listRef)
                if (measured) {
                    heightValue.value = withTiming(measured.height)
                    open.value = true
                }
            } else {
                heightValue.value = withTiming(0)
                open.value = false
            }
        })()
    }

    const isValidMediaType = (type: string): type is 'video' | 'photo' => {
        return type === 'video' || type === 'photo';
    };

    const handleNavigateToPreview = () => {
        if (selectedPhotos.length > 0) {
            const mediaType = selectedPhotos[0].mediaType;
            if (!isValidMediaType(mediaType)) {
                return; // หรือจัดการ error ตามที่ต้องการ
            }

            const selectedMedia = {
                uri: selectedPhotos[0].uri,
                type: mediaType,
                width: selectedPhotos[0].width,
                height: selectedPhotos[0].height
            };

            // navigation.navigate("preview_screen", {
            //     selectedMedia
            // });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="black" />
            <View style={[styles.mainContainer, { marginTop: Platform.OS === "ios" ? 10 : insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons
                        name="close"
                        color="white"
                        size={26}
                        onPress={() => navigation.goBack()}
                    />
                    <Pressable
                        style={styles.albumSelector}
                        onPress={handlePress}
                    >
                        <Text style={styles.textHeaderTitle} numberOfLines={1}>
                            {selectAlbums.title === "Photos" ? "แกลเลอรี" : selectAlbums.title}
                        </Text>
                        <Animated.View style={iconStyle}>
                            <Ionicons name="caret-up" color="white" size={18} />
                        </Animated.View>
                    </Pressable>
                    <View>
                        <Pressable
                            onPress={() => navigation.navigate('edit_screen')}
                            style={styles.nextContainer}
                        >
                            <Text style={styles.nextText}>Edit</Text>
                        </Pressable>
                        {selectedPhotos.length > 0 && (
                            <Pressable
                                onPress={handleNavigateToPreview}
                                style={styles.nextContainer}
                            >
                                <Text style={styles.nextText}>Next</Text>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>
                                        {selectedPhotos.length}
                                    </Text>
                                </View>
                            </Pressable>

                        )}
                    </View>
                </View>

                {/* Dropdown */}
                <Animated.View style={heightAnimationStyle}>
                    <Animated.View style={styles.contentContainer} ref={listRef}>
                        <View style={styles.content}>
                            <FlashList
                                data={albumsInfo}
                                estimatedItemSize={300}
                                renderItem={({ item, index }) => (
                                    <RenderItem
                                        item={item}
                                        index={index}
                                        handelSelectAlbums={handelSelectAlbums}
                                        selectAlbums={selectAlbums}
                                    />
                                )}
                                keyExtractor={(item, index) => `${item.title}-${index}`}
                                showsVerticalScrollIndicator={false}
                                extraData={selectAlbums}
                                overScrollMode="never"
                            />
                        </View>
                    </Animated.View>
                </Animated.View>

                {/* Tab Navigator */}
                <Tab.Navigator
                    style={styles.tabNavigator}
                    screenOptions={{
                        tabBarStyle: styles.tabBar,
                        tabBarIndicatorStyle: styles.tabIndicator,
                        tabBarActiveTintColor: "white",
                        tabBarShowLabel: false
                    }}
                >
                    <Tab.Screen
                        name="Alls"
                        component={AllsTabScreen}
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={focused ? "images" : "images-outline"}
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Photos"
                        component={PhotosTabScreen}
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={focused ? "image" : "image-outline"}
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Videos"
                        component={VideosTabScreen}
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={focused ? "videocam" : "videocam-outline"}
                                    color={color}
                                    size={24}
                                />
                            ),
                        }}
                    />
                </Tab.Navigator>

                {/* Camera Button */}
                <Pressable
                    style={styles.cameraButton}
                    onPress={() => navigation.navigate("camera_screen")}
                >
                    <Ionicons name="camera" size={30} color="white" />
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    albumSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    nextContainer: {
        position: 'relative',
    },
    nextText: {
        fontSize: 13,
        fontFamily: 'SukhumvitSet_Bd',
        color: 'white',
    },
    countBadge: {
        position: 'absolute',
        top: -5,
        right: -10,
        backgroundColor: '#ff0050',
        borderRadius: 50,
        width: 15,
        height: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countText: {
        fontSize: 8,
        fontFamily: 'SukhumvitSet_Bd',
        color: 'white',
    },
    image: {
        width: width / 3 - 2,
        height: 200,
        margin: 0.5,
    },
    textHeaderTitle: {
        color: "white",
        fontFamily: 'SukhumvitSet_Bd'
    },
    contentContainer: {
        position: 'absolute',
        width: '100%',
        top: 0,
    },
    content: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
        height: height * 0.3,
    },
    touchableOpacity: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 10,
        paddingVertical: 5,
        borderRadius: 5
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    imageList: {
        width: 70,
        height: 70,
        borderRadius: 5
    },
    textContainer: {
        width: "60%",
        justifyContent: 'space-evenly'
    },
    assetCountText: {
        fontFamily: 'SukhumvitSet_Me',
        marginLeft: 5,
        color: "white",
        fontSize: 12
    },
    tabNavigator: {
        width: "100%",
        backgroundColor: 'black'
    },
    tabBar: {
        backgroundColor: 'black',
        elevation: 0,
        height: 50,
        width: "50%",
        marginLeft: "25%"
    },
    tabIndicator: {
        backgroundColor: 'white',
        width: 35,
        marginLeft: "8%",
        alignItems: 'center'
    },
    cameraButton: {
        position: 'absolute',
        right: "5%",
        bottom: "9%",
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 100,
        elevation: 10
    }
})

export default CreateScreen