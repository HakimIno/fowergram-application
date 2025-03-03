import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import Animated, { ZoomIn, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import EmojiPicker from './EmojiPicker'

interface ChatInputProps {
    message: string;
    onChangeMessage: (text: string) => void;
    onSendMessage: () => void;
    theme: any;
    inputScale: Animated.SharedValue<number>;
    inputHeight: Animated.SharedValue<number>;
    attachButtonRotate: Animated.SharedValue<number>;
    onFocus: () => void;
    onBlur: () => void;
    onAttachPress: () => void;
}

type InputMode = 'keyboard' | 'emoji' | 'gif' | 'sticker';

const ChatInput: React.FC<ChatInputProps> = ({
    message,
    onChangeMessage,
    onSendMessage,
    theme,
    inputScale,
    inputHeight,
    attachButtonRotate,
    onFocus,
    onBlur,
    onAttachPress
}) => {
    const [inputMode, setInputMode] = useState<InputMode>('keyboard');

    const inputWrapperStyle = useAnimatedStyle(() => ({
        transform: [{ scale: inputScale.value }]
    }));

    const attachButtonStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${attachButtonRotate.value}deg` }]
    }));

    const inputContainerStyle = useAnimatedStyle(() => ({
        height: withSpring(inputHeight.value, {
            damping: 15,
            stiffness: 200
        })
    }));

    const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number } } }) => {
        const newHeight = Math.min(Math.max(40, event.nativeEvent.contentSize.height), 100);
        inputHeight.value = newHeight;
    };

    const handleSelectEmoji = (emoji: string) => {
        onChangeMessage(message + emoji);
    };

    const handleSelectSticker = (sticker: { id: string, url: string }) => {
        // Handle sticker selection
        setInputMode('keyboard');
    };

    const getInputIcon = () => {
        switch (inputMode) {
            case 'keyboard':
                return <Ionicons name="happy-outline" size={24} color={theme.textColor + '80'} />;
            default:
                return <Ionicons name="keypad-outline" size={24} color={theme.textColor + '80'} />;
        }
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.inputWrapper,
                    { backgroundColor: theme.cardBackground },
                    inputWrapperStyle,
                    inputContainerStyle
                ]}
            >
                <Pressable
                    style={styles.iconButton}
                    onPress={() => setInputMode(inputMode === 'keyboard' ? 'emoji' : 'keyboard')}
                >
                    {getInputIcon()}
                </Pressable>

                <TextInput
                    style={[styles.input, { color: theme.textColor }]}
                    placeholder="ส่งข้อความ..."
                    placeholderTextColor={theme.textColor + '80'}
                    value={message}
                    onChangeText={onChangeMessage}
                    multiline
                    onFocus={() => {
                        onFocus();
                        setInputMode('keyboard');
                    }}
                    onBlur={onBlur}
                    onContentSizeChange={handleContentSizeChange}
                />

                <Animated.View style={attachButtonStyle}>
                    <Pressable
                        style={styles.iconButton}
                        onPress={onAttachPress}
                    >
                        <Ionicons name="attach" size={24} color={theme.textColor + '80'} />
                    </Pressable>
                </Animated.View>
            </Animated.View>

            {message ? (
                <Pressable
                    style={[styles.sendButton, { backgroundColor: theme.primary }]}
                    onPress={onSendMessage}
                >
                    <Animated.View
                        entering={ZoomIn.delay(100).springify()}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </Animated.View>
                </Pressable>
            ) : (
                <Pressable
                    style={[styles.sendButton, { backgroundColor: theme.primary }]}
                    onPress={() => setInputMode('sticker')}
                >
                    <Animated.View
                        entering={ZoomIn.delay(100).springify()}
                    >
                        <Ionicons name="happy" size={20} color="white" />
                    </Animated.View>
                </Pressable>
            )}

            {inputMode !== 'keyboard' && (
                <EmojiPicker
                    mode={inputMode}
                    onChangeMode={setInputMode}
                    onSelectEmoji={handleSelectEmoji}
                    onSelectSticker={handleSelectSticker}
                    theme={theme}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        minHeight: 40,
    },
    iconButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        maxHeight: 100,
        paddingVertical: 8,
        fontFamily: 'SukhumvitSet_Me',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 16,
        bottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
})

export default ChatInput 