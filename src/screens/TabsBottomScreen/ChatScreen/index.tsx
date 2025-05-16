import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, StatusBar, Platform } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    FadeIn,
    FadeOut
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'src/context/ThemeContext'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'
import { BlurView } from 'expo-blur'
import { MeshGradient } from '@kuss/react-native-mesh-gradient'
import ActivityIndicator from 'src/components/ActivityIndicator'

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>

interface ChatItem {
    id: string
    avatar: string
    name: string
    lastMessage: string
    timestamp: string
    unreadCount?: number
    isOnline?: boolean
    isTyping?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const MOCK_CHATS: ChatItem[] = [
    {
        id: '1',
        avatar: 'https://i.pravatar.cc/150?img=1',
        name: 'Sarah Wilson',
        lastMessage: 'Hey, how are you doing?',
        timestamp: '2m',
        unreadCount: 3,
        isOnline: true,
    },
    {
        id: '2',
        avatar: 'https://i.pravatar.cc/150?img=2',
        name: 'John Developer',
        lastMessage: 'The project looks great! 🚀',
        timestamp: '1h',
        isTyping: true,
    },
    {
        id: '3',
        avatar: 'https://i.pravatar.cc/150?img=3',
        name: 'Design Team',
        lastMessage: 'New UI updates are ready for review',
        timestamp: '2h',
        unreadCount: 5,
    },
    // Add more mock data as needed
]

const GRADIENT_COLORS = {
    light: [
        '#C9D6FF', '#E2E2E2', '#F5F7FA',
        '#E9F3FF', '#D5E3FF', '#F7F7F7',
        '#F9FBFF', '#E0EAFC', '#CFDEF3'
    ],
    dark: [
        '#2A2A72', '#1565C0', '#0D47A1',
        '#0D47A1', '#1E3B70', '#132743',
        '#0D324D', '#1A237E', '#051937'
    ]
}

const GRADIENT_POINTS = [
    [0.0, 0.0], [0.5, 0.0], [1.0, 0.0],
    [0.0, 0.5], [0.5, 0.5], [1.0, 0.5],
    [0.0, 1.0], [0.5, 1.0], [1.0, 1.0],
]

const ChatItem = React.memo(({ item, onPress }: { item: ChatItem, onPress: () => void }) => {
    const { theme, isDarkMode } = useTheme()
    const pressAnimation = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: pressAnimation.value }],
        }
    })

    const handlePressIn = () => {
        pressAnimation.value = withSpring(0.97)
    }

    const handlePressOut = () => {
        pressAnimation.value = withSpring(1)
    }

    return (
        <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            style={[styles.chatItem, animatedStyle]}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
        >
            <BlurView
                intensity={isDarkMode ? 30 : 60}
                tint={isDarkMode ? "dark" : "light"}
                style={styles.chatItemBlur}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item.avatar }}
                        style={styles.avatar}
                        contentFit="cover"
                        transition={200}
                    />
                    {item.isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={[styles.chatName, { color: theme.textColor }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.timestamp, { color: theme.textColor + '80' }]}>
                            {item.timestamp}
                        </Text>
                    </View>

                    <View style={styles.chatPreview}>
                        {item.isTyping ? (
                            <Text style={[styles.typingText, { color: theme.primary }]}>
                                typing...
                            </Text>
                        ) : (
                            <Text style={[styles.lastMessage, { color: theme.textColor + '99' }]} numberOfLines={1}>
                                {item.lastMessage}
                            </Text>
                        )}

                        {item.unreadCount && (
                            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </BlurView>
        </AnimatedPressable>
    )
})

const ChatScreen = () => {
    const insets = useSafeAreaInsets()
    const { theme, isDarkMode } = useTheme()
    const [searchQuery, setSearchQuery] = useState('')
    const searchBarHeight = useSharedValue(0)
    const navigation = useNavigation<ChatScreenNavigationProp>()

    const filteredChats = useMemo(() => {
        return MOCK_CHATS.filter(chat =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const handleChatPress = useCallback((chatId: string) => {
        const selectedChat = MOCK_CHATS.find(chat => chat.id === chatId)
        if (selectedChat) {
            navigation.navigate('chat_conversation', {
                user: {
                    id: selectedChat.id,
                    name: selectedChat.name,
                    avatar: selectedChat.avatar,
                    isOnline: selectedChat.isOnline || false
                }
            })
        }
    }, [navigation])

    const renderItem = useCallback(({ item }: { item: ChatItem }) => (
        <ChatItem
            item={item}
            onPress={() => handleChatPress(item.id)}
        />
    ), [handleChatPress])

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* <MeshGradient
                colors={isDarkMode ? 
                    ['#2A2A72', '#4f46e5', '#3730a3', '#132743'] : 
                    ['#818cf8', '#eef2ff', '#eef2ff', '#fdf2f8']}
                style={{
                    flex: 1,
                    height: '100%',
                    pointerEvents: 'none',
                    position: 'absolute',
                    width: '100%',
                }}
            /> */}

            <View style={{ flex: 0.5, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size={40} />
            </View>


            {/* Header */}
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <Text style={[styles.title, { color: theme.textColor }]}>Chats</Text>
                </View>

                {/* Search Bar */}
                <BlurView
                    intensity={isDarkMode ? 40 : 70}
                    tint={isDarkMode ? "dark" : "light"}
                    style={styles.searchContainer}
                >
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={theme.textColor + '80'} />
                        <TextInput
                            placeholder="Search"
                            placeholderTextColor={theme.textColor + '80'}
                            style={[styles.searchInput, { color: theme.textColor }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </BlurView>

                {/* Chat List */}
                <FlashList
                    data={filteredChats}
                    renderItem={renderItem}
                    estimatedItemSize={350}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    keyExtractor={item => item.id}
                />
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    safeArea: {
        flex: 1,
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginVertical: 12,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginBottom: 14,
        borderRadius: 16,
        overflow: 'hidden',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Chirp_Medium',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    chatItem: {
        marginBottom: 12,
        borderRadius: 16,
        overflow: 'hidden',
    },
    chatItemBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: 'white',
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 13,
        fontWeight: '500',
    },
    chatPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        flex: 1,
    },
    typingText: {
        fontSize: 14,
        fontStyle: 'italic',
        fontWeight: '500',
    },
    unreadBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
})

export default ChatScreen

