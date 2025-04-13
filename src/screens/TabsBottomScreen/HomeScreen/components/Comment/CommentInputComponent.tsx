import React, { useRef, useState, RefObject } from 'react';
import { View, TextInput, TouchableOpacity, Text, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SuggestionsListComponent from './SuggestionsListComponent';

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
  inputRef?: RefObject<TextInput>;
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
  
  // ใช้ external input ref ถ้ามี หรือ local ref ถ้าไม่มี
  const inputRefToUse = externalInputRef || localInputRef;

  return (
    <Animated.View style={styles.inputContainerWrapper}>
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
                console.log('Canceling reply');
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
              defaultValue={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onFocus={() => setIsKeyboardVisible(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (inputRefToUse.current?.isFocused?.() !== true) {
                    setIsKeyboardVisible(false);
                  }
                }, 100);
              }}
              keyboardType="default"
              returnKeyType="done"
              blurOnSubmit={false}
              autoCapitalize="none"
              autoCorrect={false}
              enablesReturnKeyAutomatically={Platform.OS === 'ios'}
              textAlignVertical="center"
              scrollEnabled={Platform.OS === 'ios'}
              keyboardAppearance={Platform.OS === 'ios' ? (colors.text.primary === '#ffffff' ? 'dark' : 'light') : undefined}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() && styles.sendButtonActive
            ]}
            onPress={replyingTo ? handleSubmitReply : handleSubmitComment}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? colors.text.inverse : colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default CommentInputComponent; 