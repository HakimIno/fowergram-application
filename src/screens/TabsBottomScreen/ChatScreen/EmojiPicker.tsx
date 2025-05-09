import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import Animated, { 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    useSharedValue,
    SlideInDown,
    Layout
} from 'react-native-reanimated'

type PickerMode = 'emoji' | 'gif' | 'sticker';

interface EmojiPickerProps {
    mode: PickerMode;
    onChangeMode: (mode: PickerMode) => void;
    onSelectEmoji?: (emoji: string) => void;
    onSelectGif?: (gif: { id: string, url: string }) => void;
    onSelectSticker?: (sticker: { id: string, url: string }) => void;
    theme: any;
}

const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
    '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒'
];

const STICKER_SETS = [
    {
        id: 'recent',
        name: 'ล่าสุด',
        stickers: [
            { 
                id: 'wave', 
                url: 'https://media.tenor.com/images/f80d1c11c0d4e33b3f5eaf6b11faf823/tenor.gif',
                width: 80,
                height: 80
            }
        ]
    },
    {
        id: 'emotions',
        name: 'อารมณ์',
        stickers: [
            { 
                id: 'happy', 
                url: 'https://media.tenor.com/images/ae40e2e6420851ac0e48bb40670c39e4/tenor.gif',
                width: 80,
                height: 80
            },
            { 
                id: 'love', 
                url: 'https://media.tenor.com/images/2b9cdc40d469c96a65c7e4f26e41e897/tenor.gif',
                width: 80,
                height: 80
            },
            { 
                id: 'sad', 
                url: 'https://media.tenor.com/images/7ef999b077d8f2c964a1698cbecd8492/tenor.gif',
                width: 80,
                height: 80
            }
        ]
    }
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const EmojiPicker: React.FC<EmojiPickerProps> = ({
    mode,
    onChangeMode,
    onSelectEmoji,
    onSelectGif,
    onSelectSticker,
    theme
}) => {
    const translateY = useSharedValue(300);
    const opacity = useSharedValue(0);

    useEffect(() => {
        translateY.value = withSpring(0, {
            damping: 15,
            stiffness: 150
        });
        opacity.value = withTiming(1, { duration: 200 });
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value
    }));

    const renderContent = () => {
        switch (mode) {
            case 'emoji':
                return (
                    <ScrollView style={styles.emojiGrid} contentContainerStyle={styles.emojiGridContent}>
                        {EMOJI_LIST.map((emoji, index) => (
                            <AnimatedPressable
                                key={index}
                                style={styles.emojiButton}
                                onPress={() => onSelectEmoji?.(emoji)}
                                layout={Layout.springify()}
                            >
                                <Text style={styles.emoji}>{emoji}</Text>
                            </AnimatedPressable>
                        ))}
                    </ScrollView>
                );
            case 'gif':
                return (
                    <View style={styles.gifContainer}>
                        <View style={[styles.searchBar, { backgroundColor: theme.textColor + '10' }]}>
                            <Ionicons name="search" size={20} color={theme.textColor + '80'} />
                            <TextInput 
                                style={[styles.searchInput, { color: theme.textColor }]}
                                placeholder="ค้นหา GIF"
                                placeholderTextColor={theme.textColor + '80'}
                            />
                        </View>
                        <ScrollView style={styles.gifGrid}>
                            {/* GIF Grid Here */}
                        </ScrollView>
                    </View>
                );
            case 'sticker':
                return (
                    <ScrollView style={styles.stickerSets}>
                        {STICKER_SETS.map(set => (
                            <Animated.View 
                                key={set.id} 
                                style={styles.stickerSet}
                                entering={SlideInDown.delay(200).springify()}
                                layout={Layout.springify()}
                            >
                                <Text style={[styles.stickerSetName, { color: theme.textColor + '80' }]}>
                                    {set.name}
                                </Text>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.stickersRow}
                                    contentContainerStyle={styles.stickersRowContent}
                                >
                                    {set.stickers.map(sticker => (
                                        <AnimatedPressable
                                            key={sticker.id}
                                            style={[styles.stickerButton]}
                                            onPress={() => onSelectSticker?.(sticker)}
                                            layout={Layout.springify()}
                                        >
                                            <Image
                                                source={{ uri: sticker.url }}
                                                style={[styles.stickerImage, {
                                                    width: sticker.width,
                                                    height: sticker.height
                                                }]}
                                                contentFit="contain"
                                                transition={200}
                                            />
                                        </AnimatedPressable>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        ))}
                    </ScrollView>
                );
        }
    };

    return (
        <Animated.View 
            style={[
                styles.container, 
                { backgroundColor: theme.cardBackground },
                containerStyle
            ]}
        >
            <View style={[styles.tabBar, { borderBottomColor: theme.textColor + '10' }]}>
                <AnimatedPressable 
                    style={[
                        styles.tab,
                        mode === 'emoji' && { borderBottomColor: theme.primary }
                    ]}
                    onPress={() => onChangeMode('emoji')}
                    layout={Layout.springify()}
                >
                    <Text style={[
                        styles.tabText,
                        { color: mode === 'emoji' ? theme.primary : theme.textColor + '80' }
                    ]}>
                        Emoji
                    </Text>
                </AnimatedPressable>
                <AnimatedPressable 
                    style={[
                        styles.tab,
                        mode === 'gif' && { borderBottomColor: theme.primary }
                    ]}
                    onPress={() => onChangeMode('gif')}
                    layout={Layout.springify()}
                >
                    <Text style={[
                        styles.tabText,
                        { color: mode === 'gif' ? theme.primary : theme.textColor + '80' }
                    ]}>
                        GIF
                    </Text>
                </AnimatedPressable>
                <AnimatedPressable 
                    style={[
                        styles.tab,
                        mode === 'sticker' && { borderBottomColor: theme.primary }
                    ]}
                    onPress={() => onChangeMode('sticker')}
                    layout={Layout.springify()}
                >
                    <Text style={[
                        styles.tabText,
                        { color: mode === 'sticker' ? theme.primary : theme.textColor + '80' }
                    ]}>
                        Stickers
                    </Text>
                </AnimatedPressable>
            </View>
            {renderContent()}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 300,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabText: {
        fontSize: 15,
        fontFamily: 'Chirp_Medium',
        fontWeight: '500',
    },
    emojiGrid: {
        flex: 1,
    },
    emojiGridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
    },
    emojiButton: {
        width: '12.5%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 24,
    },
    gifContainer: {
        flex: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 8,
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 18,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        fontFamily: 'Chirp_Medium',
    },
    gifGrid: {
        flex: 1,
    },
    stickerSets: {
        flex: 1,
    },
    stickerSet: {
        paddingVertical: 8,
    },
    stickerSetName: {
        fontSize: 13,
        fontFamily: 'Chirp_Medium',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    stickersRow: {
        paddingHorizontal: 12,
    },
    stickersRowContent: {
        paddingRight: 12,
    },
    stickerButton: {
        marginHorizontal: 4,
        padding: 4,
        borderRadius: 8,
    },
    stickerImage: {
        width: 80,
        height: 80,
    },
})

export default EmojiPicker 