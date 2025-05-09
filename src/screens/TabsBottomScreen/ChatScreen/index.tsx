import { View, Text, StyleSheet, SafeAreaView, TextInput, Pressable, StatusBar } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
} from 'react-native-reanimated'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'src/context/ThemeContext'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from 'src/navigation/types'

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

const ChatItem = React.memo(({ item, onPress }: { item: ChatItem, onPress: () => void }) => {
    const { theme } = useTheme()
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <Text style={[styles.title, { color: theme.textColor }]}>Chats</Text>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.backgroundColor }]}>
                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground }]}>
                    <Ionicons name="search" size={20} color={theme.textColor + '80'} />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor={theme.textColor + '80'}
                        style={[styles.searchInput, { color: theme.textColor }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
      
    },
    editButton: {
        padding: 8,
    },
    editText: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical:14 ,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 40,
        borderRadius: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: 'Chirp_Medium'
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: 'white',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
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
        flex: 1,
        marginRight: 8,
        fontFamily: 'Chirp_Bold'
    },
    timestamp: {
        fontSize: 13,
        fontFamily: 'Chirp_Medium'
    },
    chatPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 15,
        flex: 1,
        marginRight: 8,
        fontFamily: 'Chirp_Medium'
    },
    typingText: {
        fontSize: 15,
        fontStyle: 'italic',
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
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

