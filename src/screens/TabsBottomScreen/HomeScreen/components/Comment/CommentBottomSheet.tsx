import React, { forwardRef, useCallback, useState, useImperativeHandle, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Linking, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, Animated } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import { useTheme } from 'src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
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

export interface CommentBottomSheetMethods extends BottomSheetMethods { }


const CommentBottomSheet = forwardRef<CommentBottomSheetMethods, CommentBottomSheetProps>(
  ({ handleClose, commentsCount }, ref) => {
    const { isDarkMode } = useTheme();
    const colors = useMemo(() => getThemeColors(isDarkMode), [isDarkMode]);
    const styles = useMemo(() => createStyles(isDarkMode), [isDarkMode]);
    const insets = useSafeAreaInsets();
    const bottomSheetRef = React.useRef<BottomSheetMethods>(null);
    const listRef = useRef<FlashList<CommentItem>>(null);
    const { comments, addComment, addReply, toggleLike, toggleShowAllReplies } = useCommentStore();
    const [flatComments, setFlatComments] = useState(flattenComments(comments));
    const [inputText, setInputText] = useState('');
    const [replyingTo, setReplyingTo] = useState<{ parentId: string; username: string } | null>(null);
    const [mentionSuggestions, setMentionSuggestions] = useState<Array<{ username: string, avatar: string }>>([]);
    const [hashtagSuggestions, setHashtagSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      expand: () => {
        bottomSheetRef.current?.expand();
        setIsBottomSheetVisible(true);
      },
      close: () => {
        setIsBottomSheetVisible(false);
        setTimeout(() => {
          bottomSheetRef.current?.close();
        }, 100);
      },
    }), []);

    const handleSheetClose = useCallback(() => {
      setIsBottomSheetVisible(false);
      setTimeout(() => {
        handleClose();
      }, 100);
    }, [handleClose]);

    const handleLike = useCallback((id: string, isReply: boolean = false) => {
      toggleLike(id, isReply);
    }, [toggleLike]);

    const handleShowAllReplies = useCallback((parentId: string) => {
      toggleShowAllReplies(parentId);
    }, [toggleShowAllReplies]);

    const handleReply = useCallback((parentId: string, username: string) => {
      const targetComment = parentId ?
        comments.find(c => c.id === parentId) :
        comments.find(c => c.username === username);

      if (targetComment) {
        setReplyingTo({
          parentId: targetComment.id,
          username: username
        });
        setInputText(`@${username}`);
      }
    }, [comments]);

    const generateRandomId = useCallback((length = 10) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }, []);

    const handleSubmitReply = useCallback(() => {
      if (!replyingTo || !inputText.trim()) return;

      const newReply = {
        id: generateRandomId(16),
        username: 'current_user', // Replace with actual user data
        avatar: 'https://picsum.photos/id/1/200', // Replace with actual user avatar
        comment: inputText.trim(),
        time: 'now',
        likes: 0,
        isLiked: false,
        replyTo: replyingTo.username
      };

      addReply(replyingTo.parentId, newReply);
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
    }, [inputText, replyingTo, addReply, comments, flatComments, generateRandomId]);

    const handleSubmitComment = useCallback(() => {
      if (!inputText.trim()) return;

      const newComment = {
        id: generateRandomId(16),
        username: 'current_user', // Replace with actual user data
        avatar: 'https://picsum.photos/id/1/200', // Replace with actual user avatar
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
    }, [inputText, addComment, generateRandomId]);

    // Load initial flattened comments
    React.useEffect(() => {
      setFlatComments(flattenComments(comments));
    }, [comments]);

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
        // Filter from all available users or use existing users from comments
        const filteredUsers = Array.from(new Set(
          comments.map(c => ({ username: c.username, avatar: c.avatar }))
            .concat(comments.flatMap(c =>
              c.replies?.map(r => ({ username: r.username, avatar: r.avatar })) || []
            ))
        )).filter(user =>
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

    // Handle selecting a mention suggestion
    const handleSelectMention = useCallback((username: string) => {
      const words = inputText.split(' ');
      // Don't add space after the mention to make it blend with text
      words[words.length - 1] = `@${username}`;
      setInputText(words.join(' '));
      setShowSuggestions(false);
    }, [inputText]);

    // Handle selecting a hashtag suggestion
    const handleSelectHashtag = useCallback((tag: string) => {
      const words = inputText.split(' ');
      // Don't add space after the hashtag to make it blend with text
      words[words.length - 1] = `#${tag}`;
      setInputText(words.join(' '));
      setShowSuggestions(false);
    }, [inputText]);

    const handleLinkPress = useCallback((url: string) => {
      Linking.openURL(url);
    }, []);

    // Add hashtag press handler
    const handleHashtagPress = useCallback((tag: string) => {
      // This would typically filter the posts by hashtag
      Alert.alert('Hashtag Selected', `Viewing posts with #${tag}`);
    }, []);

    // Enhanced mention press to show options
    const handleMentionPress = useCallback((username: string) => {
      Alert.alert(
        `@${username}`,
        'What would you like to do?',
        [
          {
            text: 'View Profile',
            onPress: () => {
              // This would navigate to the user profile
              // Navigation logic would be here
              Alert.alert('Navigate to profile', `Viewing ${username}'s profile`);
            }
          },
          {
            text: 'Go to Comment',
            onPress: () => {
              // Search in both the main comments array and within replies
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
                  console.error('Error scrolling:', error);
                  // If scroll fails, try again after a short delay
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

    const renderComment = useCallback(({ item, index }: { item: CommentItem, index: number }) => {
      return (
        <CommentItemComponent
          item={item}
          index={index}
          comments={comments}
          flatComments={flatComments}
          handleLike={handleLike}
          handleShowAllReplies={handleShowAllReplies}
          handleMentionPress={handleMentionPress}
          handleHashtagPress={handleHashtagPress}
          handleLinkPress={handleLinkPress}
          renderCommentText={renderCommentText}
          styles={styles}
          colors={colors}
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
      renderCommentText
    ]);


    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          handleClose={handleSheetClose}
          title={`${commentsCount} comments`}
        >
          <View style={styles.container}>
            <View style={styles.listContainer}>
              <FlashList
                ref={listRef}
                data={flatComments}
                renderItem={renderComment}
                keyExtractor={item => item.id}
                estimatedItemSize={100}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: insets.bottom + 50,
                }}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                bounces={false}
                overScrollMode="never"
                extraData={[flatComments, styles, colors]}
              />
            </View>
          </View>
        </BottomSheet>
        {isBottomSheetVisible && (
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
          />
        )}
      </Portal>
    );
  }
);

export default CommentBottomSheet;