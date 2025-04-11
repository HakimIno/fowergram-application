import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
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
  colors
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
              ref={inputRef}
              placeholder={replyingTo ? `Add a reply...` : "Add a comment..."}
              placeholderTextColor={colors.text.placeholder}
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onFocus={() => setIsKeyboardVisible(true)}
              onBlur={() => {
                setTimeout(() => {
                  if (inputRef.current?.isFocused?.() !== true) {
                    setIsKeyboardVisible(false);
                  }
                }, 100);
              }}
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