import React, { useRef, useState, RefObject, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, Animated, Platform, Keyboard, KeyboardEvent, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SuggestionsListComponent from './SuggestionsListComponent';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommentInputComponentProps {
  inputText: string;
  setInputText: (text: string) => void;
  replyingTo: { parentId: string; username: string } | null;
  setReplyingTo: (value: { parentId: string; username: string } | null) => void;
  mentionSuggestions: Array<{ username: string, avatar: string }>;
  hashtagSuggestions: string[];
  showSuggestions: boolean;
  handleSelectMention: (username: string) => void;
  handleSelectHashtag: (tag: string) => void;
  handleSubmitComment: () => void;
  handleSubmitReply: () => void;
  styles: any;
  colors: any;
  inputRef?: React.RefObject<TextInput>;
}

const CommentInputComponent: React.FC<CommentInputComponentProps> = ({
  inputText,
  setInputText,
  replyingTo,
  setReplyingTo,
  mentionSuggestions,
  hashtagSuggestions,
  showSuggestions,
  handleSelectMention,
  handleSelectHashtag,
  handleSubmitComment,
  handleSubmitReply,
  styles,
  colors,
  inputRef: externalInputRef
}) => {
  const localInputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const [keyboardWillHide, setKeyboardWillHide] = useState(false);

  // ใช้ external input ref ถ้ามี หรือ local ref ถ้าไม่มี
  const inputRefToUse = externalInputRef || localInputRef;

  // ตรวจจับ keyboard โดยใช้ Keyboard API ของ React Native แทน KeyboardController
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e: KeyboardEvent) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
        setKeyboardWillHide(false);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        setKeyboardWillHide(true);
      }
    );

    // ตรวจจับการเปลี่ยนแปลงของ keyboard frame (ขนาด/ตำแหน่ง)
    const keyboardDidChangeFrameListener = Keyboard.addListener(
      'keyboardDidChangeFrame',
      (e: KeyboardEvent) => {
        if (e.endCoordinates.height > 0) {
          setKeyboardHeight(e.endCoordinates.height);
          setIsKeyboardVisible(true);
          setKeyboardWillHide(false);
        }
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      keyboardDidChangeFrameListener.remove();
    };
  }, []);

  // ทำให้แน่ใจว่า input field จะได้รับ focus เมื่อมีการตอบกลับ
  useEffect(() => {
    if (replyingTo && inputRefToUse.current) {
      setTimeout(() => {
        inputRefToUse.current?.focus();
      }, 100);
    }
  }, [replyingTo]);

  // จัดการเมื่อ blur โดยตรง
  const handleBlur = () => {
    // เช็คว่าถ้าไม่มี focus จริงๆ แล้วให้ซ่อน keyboard
    setTimeout(() => {
      const isFocused = inputRefToUse.current?.isFocused();
      if (!isFocused) {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        setKeyboardWillHide(true);
        Keyboard.dismiss();
      }
    }, 150);
  };

  const resetInputPosition = () => {
    setIsKeyboardVisible(false);
    setKeyboardHeight(0);
    setKeyboardWillHide(true);
  };

  // รีเซ็ตตำแหน่ง input เมื่อ keyboard ถูกซ่อน
  useEffect(() => {
    if (keyboardWillHide) {
      resetInputPosition();
    }
  }, [keyboardWillHide]);

  return (
    <Animated.View
      style={[
        styles.inputContainerWrapper,
        {
          paddingBottom: Math.max(insets.bottom, 0),
          bottom: isKeyboardVisible ? keyboardHeight - (Platform.OS === 'ios' ? 0 : insets.bottom) : 0,
          transform: [],
          zIndex: 1000000,
          elevation: 1000000
        }
      ]}
    >
      {showSuggestions && (
        <SuggestionsListComponent
          mentionSuggestions={mentionSuggestions}
          hashtagSuggestions={hashtagSuggestions}
          handleSelectMention={handleSelectMention}
          handleSelectHashtag={handleSelectHashtag}
          styles={styles}
        />
      )}

      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingBadge}>
            <Text style={styles.replyingText}>
              Replying to <Text style={styles.replyingUsername}>@{replyingTo.username}</Text>
            </Text>
            <TouchableOpacity
              style={styles.cancelReplyButton}
              onPress={() => {
                setReplyingTo(null);
                setInputText('');
              }}
            >
              <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRefToUse}
              placeholder={replyingTo ? `Add a reply...` : "Add a comment..."}
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onFocus={() => {
                setIsKeyboardVisible(true);
                setKeyboardWillHide(false);
              }}
              onBlur={handleBlur}
              keyboardType="default"
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically={Platform.OS === 'ios'}
              textAlignVertical="center"
              scrollEnabled={true}
              keyboardAppearance={Platform.OS === 'ios' ? (colors.text.primary === '#ffffff' ? 'dark' : 'light') : undefined}
            />
          </View>
          <Pressable
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive
            ]}
            onPress={() => {
              if (replyingTo) {
                handleSubmitReply();
              } else {
                handleSubmitComment();
              }
              setTimeout(() => {
                inputRefToUse.current?.focus();
              }, 50);
            }}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.text.inverse : colors.text.tertiary}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};


export default CommentInputComponent; 