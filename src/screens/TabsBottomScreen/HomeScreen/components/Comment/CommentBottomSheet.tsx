import React, { forwardRef, useCallback, useState, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Linking, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Animated, TouchableWithoutFeedback } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import { useTheme } from 'src/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from 'react-native-portalize';
import { useCommentStore } from 'src/store/useCommentStore';
import { CommentBottomSheetProps, CommentItem } from './types';
import { flattenComments, parseCommentText, findCommentIndex } from './utils';
import { getThemeColors } from 'src/theme/colors';
import { createStyles } from './CommentBottomSheet.styles';
import CommentItemComponent from './CommentItemComponent';
import CommentInputComponent from './CommentInputComponent';
import CommentTextComponent from './CommentTextComponent';
import UserSelector from './UserSelector';
import { MOCK_USERS } from './mockUsers';

export interface CommentBottomSheetMethods extends BottomSheetMethods { }

// ค่าคงที่สำหรับ performance optimization
const INITIAL_BATCH_SIZE = 15; // จำนวน comments ที่จะโหลดครั้งแรก
const BATCH_INCREMENT = 15; // จำนวน comments ที่จะโหลดเพิ่มในแต่ละครั้ง
const ESTIMATED_ITEM_SIZE = 80; // ประมาณความสูงของแต่ละ comment ใน pixels

const CommentBottomSheet = forwardRef<CommentBottomSheetMethods, CommentBottomSheetProps>(
  ({ handleClose, commentsCount }, ref) => {
    const { isDarkMode } = useTheme();
    const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);
    const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode]);
    const insets = useSafeAreaInsets();
    const bottomSheetRef = React.useRef<BottomSheetMethods>(null);
    const listRef = useRef<FlashList<CommentItem>>(null);
    const { comments, addComment, addReply, toggleLike, toggleShowAllReplies } = useCommentStore();
    const [flatComments, setFlatComments] = useState<CommentItem[]>([]);
    const [visibleComments, setVisibleComments] = useState<CommentItem[]>([]);
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ parentId: string; username: string } | null>(null);
    const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ username: string, avatar: string }>>([]);
    const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
    const [isScrolling, setIsScrolling] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0].id);

    // ตัวช่วยซ่อน keyboard
    const dismissKeyboard = useCallback(() => {
      Keyboard.dismiss();
    }, []);

    // ฟังก์ชันจัดการเมื่อกด touchable area เพื่อซ่อน keyboard
    const handlePressOutside = useCallback(() => {
      if (inputRef.current?.isFocused()) {
        dismissKeyboard();
      }
    }, [dismissKeyboard]);

    // ตรวจจับการเปลี่ยนแปลงของ keyboard
    useEffect(() => {
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setIsKeyboardVisible(false);
        }
      );

      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setIsKeyboardVisible(true);
        }
      );

      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    // ทำความสะอาด state เมื่อ component ถูกทำลาย
    useEffect(() => {
      return () => {
        setIsClosing(false);
        setIsBottomSheetVisible(false);
        dismissKeyboard();
        
        // Force close bottomSheet if it's still open
        if (bottomSheetRef.current) {
          bottomSheetRef.current?.close();
        }
      };
    }, [dismissKeyboard]);

    // เพิ่มการทำความสะอาดเมื่อ unmount
    useEffect(() => {
      return () => {
        // Reset all states
        setIsBottomSheetVisible(false);
        setIsClosing(true);
        dismissKeyboard();
        
        // Force close bottomSheet if it's still open
        if (bottomSheetRef.current) {
          bottomSheetRef.current?.close();
        }
      };
    }, [dismissKeyboard]);

    useImperativeHandle(ref, () => ({
      expand: () => {
        bottomSheetRef.current?.expand();
        setIsBottomSheetVisible(true);
        setIsClosing(false);
      },
      close: () => {
        dismissKeyboard();
        setIsClosing(true);
        setIsBottomSheetVisible(false);
        setTimeout(() => {
          bottomSheetRef.current?.close();
        }, 100);
      },
    }), [dismissKeyboard]);

    const handleSheetClose = useCallback(() => {
      dismissKeyboard();
      setIsClosing(true);
      setIsBottomSheetVisible(false);
      setTimeout(() => {
        handleClose();
      }, 100);
    }, [handleClose, dismissKeyboard]);

    // ใช้ useMemo เพื่อคำนวณ flatComments เมื่อ comments เปลี่ยนแปลง
    useMemo(() => {
      const flattened = flattenComments(comments);
      setFlatComments(flattened);
      
      // ตั้งค่า initial visible comments
      setVisibleComments(flattened.slice(0, INITIAL_BATCH_SIZE));
      setVisibleCount(INITIAL_BATCH_SIZE);
    }, [comments]);
    
    // ฟังก์ชันโหลด comments เพิ่มเติม
    const loadMoreComments = useCallback(() => {
      if (isScrolling || visibleCount >= flatComments.length) return;
      
      const newVisibleCount = Math.min(visibleCount + BATCH_INCREMENT, flatComments.length);
      setVisibleCount(newVisibleCount);
      setVisibleComments(flatComments.slice(0, newVisibleCount));
    }, [flatComments, visibleCount, isScrolling]);

    // ฟังก์ชันจัดการเมื่อ scroll ถึงปลายรายการ
    const handleEndReached = useCallback(() => {
      loadMoreComments();
    }, [loadMoreComments]);
    
    // จัดการกับสถานะการ scroll
    const handleScrollBegin = useCallback(() => {
      setIsScrolling(true);
    }, []);
    
    const handleScrollEnd = useCallback(() => {
      setIsScrolling(false);
    }, []);

    const handleLike = useCallback((id: string, isReply: boolean = false) => {
      toggleLike(id, isReply);
    }, [toggleLike]);

    const handleShowAllReplies = useCallback((parentId: string) => {
      toggleShowAllReplies(parentId);
    }, [toggleShowAllReplies]);

    const handleReply = useCallback((commentId: string, username: string) => {
      setReplyingTo({
        parentId: commentId,
        username: username
      });

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }, []);

    const getCurrentUser = useCallback(() => {
      const user = MOCK_USERS.find(user => user.id === selectedUserId);
      return user || MOCK_USERS[0];
    }, [selectedUserId]);

    const generateRandomId = useCallback((length = 10) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }, []);

    const handleSubmitReply = useCallback(async () => {
      if (!replyingTo || !inputText.trim()) {

        return;
      }


      const currentUser = getCurrentUser();
      const newReply = {
        id: generateRandomId(16),
        username: currentUser.username,
        avatar: currentUser.avatar,
        comment: inputText.trim(),
        time: 'now',
        likes: 0,
        isLiked: false,
        replyTo: replyingTo.username,
        isReply: true,
        parentId: replyingTo.parentId
      };

      try {
        await addReply(replyingTo.parentId, newReply);
        setInputText('');
        setReplyingTo(null);

        // Scroll to the parent comment after adding reply
        const parentComment = comments.find(comment => comment.id === replyingTo.parentId);
        if (parentComment && listRef.current) {
          const index = flatComments.findIndex(comment => comment.id === parentComment.id);
          if (index !== -1) {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.3
              });
            }, 100);
          }
        }
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }, [inputText, replyingTo, addReply, comments, flatComments, generateRandomId, getCurrentUser]);

    const handleSubmitComment = useCallback(() => {
      if (!inputText.trim()) return;

      const currentUser = getCurrentUser();
      const newComment = {
        id: generateRandomId(16),
        username: currentUser.username,
        avatar: currentUser.avatar,
        comment: inputText.trim(),
        time: 'now',
        likes: 0,
        isLiked: false,
        replies: []
      };

      addComment(newComment);
      setInputText('');

      // Scroll to the newly added comment after a short delay to allow the list to update
      setTimeout(() => {
        if (listRef.current) {
          // The new comment will be at the beginning of the list since addComment adds to the beginning
          listRef.current.scrollToIndex({
            index: 0,
            animated: true,
            viewPosition: 0
          });
        }
      }, 300);
    }, [inputText, addComment, generateRandomId, getCurrentUser]);

    // Implement the suggestion logic
    useEffect(() => {
      if (!inputText) {
        setShowSuggestions(false);
        return;
      }

      // Get current word being typed
      const words = inputText.split(' ');
      const currentWord = words[words.length - 1];

      // Check if it's a mention (@)
      if (currentWord.startsWith('@') && currentWord.length > 1) {
        const query = currentWord.substring(1).toLowerCase();
        // Filter from all available users including mock users
        const usersFromComments = Array.from(new Set(
          comments.map(c => ({ username: c.username, avatar: c.avatar }))
            .concat(comments.flatMap(c =>
              c.replies?.map(r => ({ username: r.username, avatar: r.avatar })) || []
            ))
        ));

        const mockUserSuggestions = MOCK_USERS.map(user => ({
          username: user.username,
          avatar: user.avatar
        }));

        const allUsers = [...usersFromComments, ...mockUserSuggestions];

        const filteredUsers = allUsers.filter(user =>
          user.username.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 suggestions

        setMentionSuggestions(filteredUsers);
        setHashtagSuggestions([]);
        setShowSuggestions(filteredUsers.length > 0);
      }
      else if (currentWord.startsWith('#') && currentWord.length > 1) {
        const query = currentWord.substring(1).toLowerCase();
        const sampleHashtags = ['love', 'fashion', 'food', 'travel', 'art', 'music', 'photography', 'nature'];
        const filteredTags = sampleHashtags
          .filter(tag => tag.toLowerCase().includes(query))
          .slice(0, 5);

        setHashtagSuggestions(filteredTags);
        setMentionSuggestions([]);
        setShowSuggestions(filteredTags.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }, [inputText, comments]);

    const handleSelectMention = useCallback((username: string) => {
      const words = inputText.split(' ');
      words[words.length - 1] = `@${username}`;
      setInputText(words.join(' '));
      setShowSuggestions(false);
    }, [inputText]);

    const handleSelectHashtag = useCallback((tag: string) => {
      const words = inputText.split(' ');
      words[words.length - 1] = `#${tag}`;
      setInputText(words.join(' '));
      setShowSuggestions(false);
    }, [inputText]);

    const handleLinkPress = useCallback((url: string) => {
      Linking.openURL(url);
    }, []);

    const handleHashtagPress = useCallback((tag: string) => {
      Alert.alert('Hashtag Selected', `Viewing posts with #${tag}`);
    }, []);

    const handleMentionPress = useCallback((username: string) => {
      Alert.alert(
        `@${username}`,
        'What would you like to do?',
        [
          {
            text: 'View Profile',
            onPress: () => {

              Alert.alert('Navigate to profile', `Viewing ${username}'s profile`);
            }
          },
          {
            text: 'Go to Comment',
            onPress: () => {
              let foundIndex = -1;

              // First search in flatComments
              foundIndex = flatComments.findIndex(comment => comment.username === username);

              if (foundIndex !== -1 && listRef.current) {
                try {
                  listRef.current.scrollToIndex({
                    index: foundIndex,
                    animated: true,
                    viewPosition: 0.3
                  });
                } catch (error) {
                  setTimeout(() => {
                    listRef.current?.scrollToIndex({
                      index: foundIndex,
                      animated: true,
                      viewPosition: 0.3
                    });
                  }, 500);
                }
              } else {
                Alert.alert('Not Found', `${username} has not commented in this thread.`);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }, [flatComments]);

    const renderCommentText = useCallback((text: string) => {
      return (
        <CommentTextComponent
          text={text}
          handleMentionPress={handleMentionPress}
          handleHashtagPress={handleHashtagPress}
          handleLinkPress={handleLinkPress}
          styles={styles}
          colors={colors}
        />
      );
    }, [styles, colors, handleMentionPress, handleHashtagPress, handleLinkPress]);

    const renderComment: ListRenderItem<CommentItem> = useCallback(({ item, index }) => {
      // ถ้าเป็นการตอบกลับลูก (nested reply) ให้ดึงชื่อของ reply ที่กำลังตอบกลับมาด้วย
      let replyingToUsername = item.replyTo;
      
      // ถ้ามี replyingToReplyId (กำลังตอบกลับ reply)
      if (item.isReply && item.replyingToReplyId && item.parentId) {
        // หา comment หลัก
        const parentComment = comments.find(c => c.id === item.parentId);
        if (parentComment && parentComment.replies) {
          // หา reply ที่กำลังตอบกลับ
          const replyingTo = parentComment.replies.find(r => r.id === item.replyingToReplyId);
          if (replyingTo) {
            replyingToUsername = replyingTo.username;
          }
        }
      }

      return (
        <CommentItemComponent
          key={`comment-${item.id}-${index}`}
          item={{ ...item, replyTo: replyingToUsername }}
          index={index}
          comments={comments}
          flatComments={flatComments}
          handleLike={handleLike}
          handleReply={handleReply}
          handleShowAllReplies={handleShowAllReplies}
          handleMentionPress={handleMentionPress}
          handleHashtagPress={handleHashtagPress}
          handleLinkPress={handleLinkPress}
          renderCommentText={renderCommentText}
          styles={styles}
          colors={colors}
          isDarkMode
        />
      );
    }, [
      styles,
      colors,
      comments,
      flatComments,
      handleLike,
      handleShowAllReplies,
      handleMentionPress,
      handleHashtagPress,
      handleLinkPress,
      renderCommentText,
      handleReply
    ]);
    
    // Optimized keyExtractor - เพื่อลดการคำนวณซ้ำซ้อน
    const keyExtractor = useCallback((item: CommentItem) => item.id, []);

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          handleClose={handleSheetClose}
          title={`${commentsCount} comments`}
          keyboardAvoidingViewEnabled={false}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.container}>
              <UserSelector 
                users={MOCK_USERS}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
                colors={colors}
              />
              
              <View style={styles.listContainer}>
                <FlashList
                  ref={listRef}
                  data={visibleComments}
                  renderItem={renderComment}
                  keyExtractor={keyExtractor}
                  estimatedItemSize={ESTIMATED_ITEM_SIZE}
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.7}
                  onScrollBeginDrag={handleScrollBegin}
                  onScrollEndDrag={handleScrollEnd}
                  onMomentumScrollBegin={handleScrollBegin}
                  onMomentumScrollEnd={handleScrollEnd}
                  contentContainerStyle={{
                    paddingTop: 10,
                    paddingBottom: insets.bottom + 80,
                  }}
                  showsVerticalScrollIndicator={false}
                  removeClippedSubviews={Platform.OS === 'android'}
                  bounces={true}
                  overScrollMode="never"
                  extraData={[visibleCount, styles, colors]}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </BottomSheet>
        {isBottomSheetVisible && !isClosing && (
          <CommentInputComponent
            inputText={inputText}
            setInputText={setInputText}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            mentionSuggestions={mentionSuggestions}
            hashtagSuggestions={hashtagSuggestions}
            showSuggestions={showSuggestions}
            handleSelectMention={handleSelectMention}
            handleSelectHashtag={handleSelectHashtag}
            handleSubmitComment={handleSubmitComment}
            handleSubmitReply={handleSubmitReply}
            styles={styles}
            colors={colors}
            inputRef={inputRef as React.RefObject<TextInput>}
          />
        )}
      </Portal>
    );
  }
);

export default CommentBottomSheet;