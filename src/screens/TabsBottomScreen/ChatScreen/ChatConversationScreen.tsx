import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, StatusBar, Dimensions, LayoutChangeEvent, ScrollView, Keyboard } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useTheme } from 'src/context/ThemeContext'
import Animated, {
    SlideInDown,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
    withDelay,
    runOnJS,
    interpolate,
    Easing,
    Extrapolate
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import MessageOptionsMenu from './MessageOptionsMenu'
import ChatBackground from 'src/components/ChatBackground'
import { BlurView } from 'expo-blur'
import EmptyMessageComponent from './EmptyMessageComponent'
import StickerPicker from './StickerPicker'

interface Message {
    id: string
    text: string
    timestamp: string
    isSent: boolean
    status: 'sent' | 'delivered' | 'read'
    date?: string // For grouping messages by date
    isSticker?: boolean
    isDarkMode?: boolean
}

interface ChatConversationScreenProps {
    route: {
        params: {
            user: {
                id: string
                name: string
                avatar: string
                isOnline: boolean
            }
        }
    }
    navigation: any
}

const GREETING_STICKER = {
    id: 'wave',
    url: 'https://media.tenor.com/RT_oYjFjo0MAAAAi/utya-utya-duck.gif',
    value: '👋'
};

interface ParticleEffect {
    id: string;
    x: number;
    y: number;
    color: string;
    width: number;
    height: number;
}

interface MenuState {
    isVisible: boolean;
    x: number;
    y: number;
    messageId: string;
    messageWidth: number;
    messageHeight: number;
}

const MessageBubble: React.FC<{
    message: Message,
    theme: any,
    isDarkMode: boolean,
    onShowMenu: (messageId: string, x: number, y: number, width: number, height: number) => void
}> = React.memo(({ message, theme, onShowMenu, isDarkMode }) => {
    const bubbleRef = useRef<View>(null);
    const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const scale = useSharedValue(0.95);
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(message.isSent ? 20 : -20);

    React.useEffect(() => {
        scale.value = withSpring(1, {
            damping: 20,
            stiffness: 300,
            mass: 0.8,
            velocity: 0.4
        });
        opacity.value = withTiming(1, { duration: 200 });
        translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 300,
            mass: 0.8
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value }
        ],
        opacity: opacity.value
    }));

    const bubbleStyle = [
        styles.messageBubble,
        message.isSent ? styles.sentBubble : styles.receivedBubble,
        {
            backgroundColor: message.isSent ? theme.primary : theme.cardBackground,
        }
    ];

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        if (bubbleRef.current) {
            bubbleRef.current.measureInWindow((x, y, width, height) => {
                setLayout({ x, y, width, height });
            });
        }
    }, []);

    const handleLongPress = useCallback(() => {
        // Haptic feedback animation with smoother parameters
        scale.value = withSequence(
            withSpring(0.98, { damping: 20, stiffness: 400 }),
            withSpring(1, { damping: 15 })
        );

        // Re-measure position right before showing menu
        if (bubbleRef.current) {
            bubbleRef.current.measureInWindow((x, y, width, height) => {
                const menuX = message.isSent ? x + width - 20 : x + 20;
                const menuY = y + (height / 2);
                onShowMenu(message.id, menuX, menuY, width, height);
            });
        }
    }, [message.id, message.isSent, onShowMenu, scale]);

    const longPressGesture = Gesture.LongPress()
        .minDuration(200)
        .onStart(() => {
            'worklet';
            runOnJS(handleLongPress)();
        });

    return (
        <GestureDetector gesture={longPressGesture}>
            <Animated.View
                ref={bubbleRef}
                onLayout={handleLayout}
                style={[
                    styles.messageContainer,
                    message.isSent ? styles.sentContainer : styles.receivedContainer,
                    animatedStyle
                ]}
            >
                <View style={[
                    bubbleStyle,
                    message.isSticker && styles.stickerMessageBubble
                ]}>
                    {message.isSticker ? (
                        <View style={styles.stickerContainer}>
                            <View style={styles.stickerRow}>
                                <View style={[styles.stickerFooter]}>
                                    <Text style={[styles.timestamp, { color: isDarkMode ? '#eff6ff' : '#1a1a1a' }]}>
                                        {message.timestamp}
                                    </Text>
                                    {message.isSent && (
                                        <Animated.View
                                            entering={ZoomIn.delay(300).springify()}
                                        >
                                            <Ionicons
                                                name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
                                                size={16}
                                                color={isDarkMode ? '#eff6ff' : '#1a1a1a'}
                                                style={styles.statusIcon}
                                            />
                                        </Animated.View>
                                    )}
                                </View>
                                <Image
                                    source={{ uri: message.text }}
                                    style={[styles.messageStickerImage]}
                                    contentFit="contain"
                                    transition={200}
                                />

                            </View>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.messageText, { color: message.isSent ? theme.textMessage : theme.textColor }]}>
                                {message.text}
                            </Text>
                            <View style={styles.messageFooter}>
                                <Text style={[styles.timestamp, { color: message.isSent ? theme.textMessage : theme.textColor }]}>
                                    {message.timestamp}
                                </Text>
                                {message.isSent && (
                                    <Animated.View
                                        entering={ZoomIn.delay(300).springify()}
                                    >
                                        <Ionicons
                                            name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
                                            size={16}
                                            color={message.status === 'read' ? "white" : "white"}
                                            style={styles.statusIcon}
                                        />
                                    </Animated.View>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </Animated.View>
        </GestureDetector>
    );
});

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const KEYBOARD_HEIGHT = Platform.select({
    ios: SCREEN_HEIGHT * 0.4, // 40% of screen height for iOS
    android: 300, // Fixed height for Android
    default: 300
})

const ChatConversationScreen = ({ route, navigation }: ChatConversationScreenProps) => {
    const { user } = route.params
    const { theme, isDarkMode } = useTheme()
    const insets = useSafeAreaInsets()
    const [message, setMessage] = useState('')
    const listRef = useRef<FlashList<Message>>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [menuState, setMenuState] = useState<MenuState>({
        isVisible: false,
        x: 0,
        y: 0,
        messageId: '',
        messageWidth: 0,
        messageHeight: 0,
    })
    const inputScale = useSharedValue(1);
    const attachButtonRotate = useSharedValue(0);
    const inputHeight = useSharedValue(40);
    const [showQuickStickers, setShowQuickStickers] = useState(true);
    const [showStickerPicker, setShowStickerPicker] = useState(false);
    const stickerPickerHeight = useSharedValue(0);
    const iconRotation = useSharedValue(0);
    const inputRef = useRef<TextInput>(null);

    const handleShowMenu = useCallback((
        messageId: string,
        x: number,
        y: number,
        width: number,
        height: number
    ) => {
        setMenuState({
            isVisible: true,
            x,
            y,
            messageId,
            messageWidth: width,
            messageHeight: height,
        })
    }, [])

    const handleCloseMenu = useCallback(() => {
        setMenuState(prev => ({ ...prev, isVisible: false }))
    }, [])

    const handleCopyMessage = useCallback(() => {
        const message = messages.find(msg => msg.id === menuState.messageId)
        if (message) {
            // Copy message text to clipboard
            handleCloseMenu()
        }
    }, [menuState.messageId, messages])

    const handleDeleteMessage = useCallback(() => {
        const selectedMessage = messages.find(msg => msg.id === menuState.messageId);

        if (selectedMessage) {
            handleCloseMenu();
            setMessages(prev => prev.filter(msg => msg.id !== menuState.messageId));
        }
    }, [menuState, theme.primary, messages, handleCloseMenu]);


    const renderItem = useCallback(({ item }: { item: Message }) => (
        <MessageBubble
            message={item}
            theme={theme}
            onShowMenu={handleShowMenu}
            isDarkMode={isDarkMode}
        />
    ), [theme, handleShowMenu, isDarkMode])

    const scrollToBottom = useCallback((animated = true) => {
        if (listRef.current && messages.length > 0) {
            listRef.current.scrollToIndex({
                index: messages.length - 1,
                animated
            });
        }
    }, [messages.length]);

    // Scroll to bottom on initial render
    React.useEffect(() => {
        setTimeout(() => scrollToBottom(false), 100);
    }, []);

    const handleSendMessage = useCallback(() => {
        if (!message.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: message.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            status: 'sent'
        };

        setMessages(prev => [...prev, newMessage]);
        setMessage('');

        // Scroll to bottom with animation after sending
        setTimeout(() => scrollToBottom(), 100);
    }, [message, scrollToBottom]);

    const handleCloseStickerPicker = useCallback(() => {
        stickerPickerHeight.value = withTiming(0, {
            duration: 250,
        }, () => {
            runOnJS(setShowStickerPicker)(false);
        });
        iconRotation.value = withSpring(0, {
            damping: 15,
            stiffness: 200
        });
    }, []);

    const handleFocus = useCallback(() => {
        if (showStickerPicker) {
            setShowStickerPicker(false);
            stickerPickerHeight.value = 0;
            iconRotation.value = 0;
        }

        inputScale.value = withSpring(1.02, {
            damping: 10,
            stiffness: 200
        });
    }, [showStickerPicker]);

    const handleBlur = useCallback(() => {
        inputScale.value = withSpring(1);
    }, []);

    const handleAttachPress = useCallback(() => {
        attachButtonRotate.value = withSequence(
            withSpring(45, { damping: 10 }),
            withDelay(1000, withSpring(0))
        );
    }, []);

    const inputWrapperStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withTiming(inputScale.value, { duration: 100 }) }]
    }));

    const attachButtonStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${attachButtonRotate.value}deg` }]
    }));

    const inputAreaStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    stickerPickerHeight.value,
                    [0, 1],
                    [0, -KEYBOARD_HEIGHT]
                )
            }
        ]
    }));

    const handleContentSizeChange = useCallback((event: { nativeEvent: { contentSize: { height: number } } }) => {
        const newHeight = Math.min(Math.max(40, event.nativeEvent.contentSize.height), 100);
        inputHeight.value = newHeight;
    }, []);

    const handleSendSticker = useCallback(() => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text: GREETING_STICKER.url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            status: 'sent',
            isSticker: true
        };

        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => scrollToBottom(), 100);
    }, [scrollToBottom]);

    const handleCloseQuickStickers = useCallback(() => {
        setShowQuickStickers(false);
    }, []);

    const QuickStickersHeader = useCallback(() => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <View style={{ width: 22 }} />
            <View style={{ paddingVertical: 2, paddingHorizontal: 12, borderRadius: 12, backgroundColor: theme.cardBackground + '80' }}>
                <Text style={[styles.stickerButtonText, { color: theme.textColor }]}>
                    ทักทายด้วยสติกเกอร์
                </Text>
            </View>
            <Pressable onPress={handleCloseQuickStickers} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.textColor} />
            </Pressable>
        </View>
    ), [theme, handleCloseQuickStickers]);


    const handleSelectSticker = useCallback((sticker: { id: string, url: string }) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text: sticker.url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            status: 'sent',
            isSticker: true
        };

        setMessages(prev => [...prev, newMessage]);
        handleCloseStickerPicker();
        setTimeout(() => scrollToBottom(), 100);
    }, [scrollToBottom]);


    const iconStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateZ: `${interpolate(
                        iconRotation.value,
                        [0, 1],
                        [0, 180],
                        Extrapolate.CLAMP
                    )}deg`
                }
            ],
            opacity: interpolate(
                iconRotation.value,
                [0, 0.5, 1],
                [1, 0.8, 1],
                Extrapolate.CLAMP
            )
        };
    });

    const handleToggleStickerKeyboard = useCallback(() => {
        const config = {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        };

        if (showStickerPicker) {
            // ปิด sticker picker โดยไม่ต้องรอ animation จบ
            setShowStickerPicker(false);
            
            // ทำ animation พร้อมกัน
            stickerPickerHeight.value = withTiming(0, config);
            iconRotation.value = withTiming(0, config);
            
            // เปิด keyboard ทันทีเพื่อให้ transition ลื่นไหล
            inputRef.current?.focus();
        } else {
            // ปิด keyboard และเปิด sticker picker พร้อมกัน
            Keyboard.dismiss();
            setShowStickerPicker(true);
            
            // ทำ animation พร้อมกันทันที
            stickerPickerHeight.value = withSpring(1, {
                damping: 20,
                stiffness: 150,
                mass: 1
            });
            
            iconRotation.value = withSpring(1, {
                damping: 20,
                stiffness: 150 
            });
        }
    }, [showStickerPicker]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>

            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.backgroundColor }]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ChatBackground
                    isDarkMode={isDarkMode}
                    backgroundColor={theme.backgroundColor}
                />

                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

                {/* Header */}
                <BlurView intensity={90} tint={isDarkMode ? 'dark' : 'light'} style={[styles.header, {
                    paddingTop: insets.top,
                    borderBottomColor: theme.cardBackground + '40',
                }]}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color={theme.textColor} />
                    </Pressable>

                    <Pressable style={styles.userInfo}>
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatar}
                            contentFit="cover"
                            transition={200}
                        />
                        <View style={styles.userTextInfo}>
                            <Text style={[styles.userName, { color: theme.textColor }]}>
                                {user.name}
                            </Text>
                            <Text style={[styles.userStatus, { color: theme.textColor + '80' }]}>
                                {user.isOnline ? 'online' : 'offline'}
                            </Text>
                        </View>
                    </Pressable>

                    <View style={styles.actionButtons}>
                        <Pressable
                            style={[styles.iconButton, { backgroundColor: theme.cardBackground + '20' }]}
                            onPress={() => navigation.navigate('call_screen', { user, type: 'voice' })}
                        >
                            <Ionicons name="call" size={22} color={theme.textColor} />
                        </Pressable>
                        <Pressable
                            style={[styles.iconButton, { backgroundColor: theme.cardBackground + '20' }]}
                            onPress={() => navigation.navigate('call_screen', { user, type: 'video' })}
                        >
                            <Ionicons name="videocam" size={22} color={theme.textColor} />
                        </Pressable>
                    </View>
                </BlurView>

                {/* Messages List */}
                <View style={styles.listContainer}>
                    <FlashList
                        ref={listRef}
                        data={messages}
                        renderItem={renderItem}
                        inverted={false}
                        contentContainerStyle={{
                            padding: 16,
                            paddingBottom: messages.length > 0 ? 16 : 160
                        }}
                        onContentSizeChange={() => scrollToBottom()}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews
                        estimatedItemSize={350}
                        bounces={false}
                        overScrollMode="never"
                        ListEmptyComponent={() => (
                            <EmptyMessageComponent theme={theme} avatar={user.avatar} username={user.name} />
                        )}
                        
                    />
                </View>

                {/* Particle Effects */}
                {/* {particleEffects.map(effect => (
                    <ParticleExplosion
                        key={effect.id}
                        x={effect.x}
                        y={effect.y}
                        color={effect.color}
                        width={effect.width}
                        height={effect.height}
                        onComplete={() => handleParticleComplete(effect.id)}
                    />
                ))} */}

                {/* Message Options Menu */}
                <MessageOptionsMenu
                    isVisible={menuState.isVisible}
                    x={menuState.x}
                    y={menuState.y}
                    onDelete={handleDeleteMessage}
                    onCopy={handleCopyMessage}
                    onClose={handleCloseMenu}
                    theme={theme}
                />

                {/* Input Area */}
                <Animated.View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: theme.backgroundColor,
                            borderTopColor: theme.cardBackground,
                        },
                        inputAreaStyle
                    ]}
                >
                    {messages.length === 0 && showQuickStickers && (
                        <View style={[styles.quickStickersContainer]}>
                            <QuickStickersHeader />
                            <View style={styles.quickStickerButtons}>
                                <Pressable
                                    style={[styles.stickerButton]}
                                    onPress={handleSendSticker}
                                >
                                    <Image
                                        source={{ uri: GREETING_STICKER.url }}
                                        style={styles.stickerImage}
                                        contentFit="contain"
                                        transition={200}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    )}

                    <Animated.View
                        style={[
                            styles.inputWrapper,
                            { backgroundColor: theme.cardBackground, gap: 8 },
                            inputWrapperStyle
                        ]}
                    >
                        <Pressable
                            style={[styles.moreStickerButton, { backgroundColor: theme.cardBackground, }]}
                            onPress={handleToggleStickerKeyboard}
                        >
                            <Animated.View style={iconStyle}>
                                <Ionicons
                                    name={showStickerPicker ? "keypad-outline" : "apps-outline"}
                                    size={24}
                                    color={theme.textColor + '80'}
                                />
                            </Animated.View>
                        </Pressable>
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { color: theme.textColor }]}
                            placeholder="ส่งข้อความ..."
                            placeholderTextColor={theme.textColor + '80'}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onContentSizeChange={handleContentSizeChange}
                        />
                        <Animated.View style={attachButtonStyle}>
                            <Pressable
                                style={styles.attachButton}
                                onPress={handleAttachPress}
                            >
                                <Ionicons name="attach" size={24} color={theme.textColor + '80'} />
                            </Pressable>
                        </Animated.View>
                    </Animated.View>

                    <Pressable
                        style={[styles.sendButton, { backgroundColor: theme.primary }]}
                        onPress={handleSendMessage}
                    >
                        <Animated.View entering={ZoomIn.delay(100).springify()}>
                            <Ionicons name="send" size={20} color="white" />
                        </Animated.View>
                    </Pressable>
                </Animated.View>

                {/* Sticker Picker */}
                <StickerPicker
                    isVisible={showStickerPicker}
                    height={stickerPickerHeight}
                    theme={theme}
                    onClose={handleCloseStickerPicker}
                    onSelectSticker={handleSelectSticker}
                />
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 12,

    },
    backButton: {
        padding: 8,
        marginRight: 4,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userTextInfo: {
        marginLeft: 12,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userStatus: {
        fontSize: 13,
        fontWeight: '400',
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    iconButton: {
        padding: 8,
        marginLeft: 6,
        borderRadius: 20,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexGrow: 1,
    },
    messageContainer: {
        marginVertical: 4,
        maxWidth: '80%',
    },
    sentContainer: {
        alignSelf: 'flex-end',
    },
    receivedContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minWidth: 80,
    },
    sentBubble: {
        borderTopRightRadius: 4,
    },
    receivedBubble: {
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Chirp_Medium',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 10,
        marginRight: 4,
        fontFamily: 'Chirp_Medium',
    },
    statusIcon: {
        marginLeft: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 1,
        position: 'relative',
        zIndex: 2,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 16,
        marginRight: 8,
        minHeight: 50,
        zIndex: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 8,
        fontFamily: 'Chirp_Medium',
    },
    attachButton: {
        padding: 4,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    timestampDividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    timestampDividerLine: {
        flex: 1,
        height: 1,
    },
    timestampDividerBadge: {
        padding: 4,
        borderRadius: 4,
    },
    timestampDividerText: {
        fontSize: 10,
        fontFamily: 'Chirp_Medium',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 4,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
    },
    listContainer: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 160
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Chirp_Medium',
        textAlign: 'center',
    },
    messageOptionsMenu: {
        position: 'absolute',
        zIndex: 1000,
        elevation: 5,
    },
    quickStickersContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        gap: 8,
    },
    stickerButton: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    stickerButtonText: {
        fontSize: 12,
        fontFamily: 'Chirp_Medium',
    },
    stickerImage: {
        width: "100%",
        height: "100%",
    },
    messageStickerImage: {
        width: 120,
        height: 120,
    },
    stickerMessageBubble: {
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    stickerContainer: {
        alignItems: 'flex-start',
    },
    stickerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    stickerFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 4,
        marginBottom: 4,
        minWidth: 50,
    },
    quickStickerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    moreStickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 100,

    },
    moreStickerText: {
        fontSize: 14,
        fontFamily: 'Chirp_Medium',
    },
    stickerPicker: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 8,
        overflow: 'hidden',
        zIndex: 1,
        elevation: 1,
    },
    stickerPickerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    stickerPickerTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Chirp_Medium',
    },
    categoryTabs: {
        flexGrow: 0,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginHorizontal: 4,
        borderWidth: 1,
    },
    selectedCategoryTab: {
        backgroundColor: 'transparent',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'Chirp_Medium',
    },
    stickersGrid: {
        flex: 1,
    },
    stickersGridContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 8,
        gap: 8,
    },
    gridStickerButton: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridStickerImage: {
        width: '80%',
        height: '80%',
    },
})

export default ChatConversationScreen 