import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, Dimensions, Animated, Vibration, Keyboard, Platform, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { CommentItem } from './types';
import CommentActionsComponent from './CommentActionsComponent';
import { BlurView } from 'expo-blur';
import { Portal } from 'react-native-portalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface CommentItemComponentProps {
  item: CommentItem;
  index: number;
  comments: CommentItem[];
  flatComments: CommentItem[];
  handleLike: (id: string, isReply: boolean) => void;
  handleReply: (id: string, username: string) => void;
  handleShowAllReplies: (parentId: string) => void;
  handleMentionPress: (username: string) => void;
  handleHashtagPress: (tag: string) => void;
  handleLinkPress: (url: string) => void;
  renderCommentText: (text: string) => React.ReactNode;
  styles: any;
  colors: any;
  isDarkMode?: boolean
}

interface CommentContentProps {
  item: CommentItem;
  handleReply: (id: string, username: string) => void;
  handleMentionPress: (username: string) => void;
  renderCommentText: (text: string) => React.ReactNode;
  showMenu?: boolean;
  closeMenu?: () => void;
  styles: any;
  colors: any;
  isDarkMode?: boolean
}

// Component for rendering the comment content
const CommentContent: React.FC<CommentContentProps> = ({
  item,
  handleReply,
  handleMentionPress,
  renderCommentText,
  styles,
  colors,
  showMenu,
  closeMenu
}) => (
  <View style={styles.commentContent}>
    <View style={styles.commentHeader}>
      <Text style={styles.username}>{item.username}</Text>
      <Text style={styles.time}>{item.time} ago</Text>
    </View>

    {item.replyTo && (
      <Text style={[styles.commentText, { fontSize: 12, color: colors.text.tertiary, marginBottom: 2 }]}>
        Replying to{' '}
        <Text
          style={{ color: colors.primary }}
          onPress={() => handleMentionPress(item.replyTo || '')}
        >
          @{item.replyTo}
        </Text>
      </Text>
    )}

    {renderCommentText(item.comment)}

    <Pressable
      style={styles.replyButton}
      onPress={() => {
        if (showMenu && typeof closeMenu === 'function') {
          closeMenu();
          // เพิ่มตัวหน่วงเวลาเล็กน้อยก่อนจะเรียก handleReply หลังจากปิด menu
          setTimeout(() => {
            handleReply(item.id, item.username);
          }, 100);
        } else {
          handleReply(item.id, item.username);
        }
      }}
      delayHoverIn={0}
      delayLongPress={50}
      unstable_pressDelay={0}
    >
      <Text style={styles.replyText}>Reply</Text>
    </Pressable>
  </View >
);

interface ContextMenuProps {
  showMenu: boolean;
  menuPlacement: 'bottom' | 'top';
  menuPosition: { x: number; y: number; width: number; height: number };
  menuAnimation: Animated.Value;
  handleReport: () => void;
  handleBlock: () => void;
  closeMenu: () => void;
  colors: any;
  screenDimensions: { width: number; height: number };
  isLongComment: boolean;
}

// Component for the context menu
const ContextMenu: React.FC<ContextMenuProps> = ({
  showMenu,
  menuPlacement,
  menuPosition,
  menuAnimation,
  handleReport,
  handleBlock,
  closeMenu,
  colors,
  screenDimensions,
  isLongComment,

}) => {
  // Calculate position to ensure menu stays within screen bounds
  const menuWidth = 150;
  const menuLeft = Math.min(
    menuPosition.x,
    screenDimensions.width - menuWidth - 10
  );

  // Consistent offset for both top and bottom placement
  const verticalOffset = isLongComment ? 15 : 15;

  // Approximate menu height (two menu items with padding)
  const menuHeight = 82; // Two items of 12px padding + text height

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: menuPlacement === 'bottom'
          ? menuPosition.y + menuPosition.height + verticalOffset
          : menuPosition.y - menuHeight - verticalOffset,
        left: menuLeft,
        backgroundColor: colors.background.primary,
        borderRadius: 8,
        elevation: 5,
        zIndex: 100000,
        width: menuWidth,
        transform: [
          {
            translateY: menuAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [menuPlacement === 'bottom' ? 20 : -20, 0]
            })
          },
          {
            scale: menuAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1]
            })
          }
        ],
        opacity: menuAnimation,
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          borderBottomWidth: 0.2,
          borderBottomColor: colors.border.light,
          gap: 6
        }}
        onPress={handleReport}
        activeOpacity={0.6}
      >
        <Ionicons name="flag-outline" size={20} color="red" />
        <Text style={{ color: 'red', fontFamily: "Chirp_Medium", fontSize: 15 }}>รายงาน</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          gap: 6
        }}
        onPress={handleBlock}
        activeOpacity={0.6}
      >
        <Ionicons name="ban" size={20} color={colors.text.primary} />
        <Text style={{ color: colors.text.primary, fontFamily: 'Chirp_Medium', fontSize: 15 }}>บล็อกบัญชี</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CommentItemComponent: React.FC<CommentItemComponentProps> = ({
  item,
  index,
  comments,
  flatComments,
  handleLike,
  handleReply,
  handleShowAllReplies,
  handleMentionPress,
  renderCommentText,
  styles,
  colors,
  isDarkMode
}) => {
  // State and refs
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [commentRef, setCommentRef] = useState<View | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<'bottom' | 'top'>('bottom');
  const [modalMaxHeight, setModalMaxHeight] = useState(0);
  const [isLongComment, setIsLongComment] = useState(false);

  // Animation values
  const blurAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;

  // Hooks
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Computed values
  const parentComment = item.isReply && item.parentId
    ? comments.find(comment => comment.id === item.parentId)
    : null;

  const isLastVisibleReply = item.isReply &&
    item.parentId &&
    (index === flatComments.length - 1 ||
      flatComments[index + 1].isReply !== true ||
      flatComments[index + 1].parentId !== item.parentId);

  const parentRepliesCount = parentComment?.replies?.length || 0;

  const shouldShowViewAllButton = isLastVisibleReply &&
    parentComment &&
    !parentComment._showAllReplies &&
    parentRepliesCount > 2;

  const shouldShowHideButton = isLastVisibleReply &&
    parentComment &&
    parentComment._showAllReplies &&
    parentRepliesCount > 2;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handlers
  const handleLongPress = useCallback(() => {
    Vibration.vibrate(Platform.OS === 'ios' ? [0, 25] : 25);

    if (commentRef) {
      commentRef.measure((x, y, width, height, pageX, pageY) => {
        // Check if this is a long comment (more than 100 characters)
        const isLong = item.comment.length > 512;
        setIsLongComment(isLong);

        const availableSpaceBelow = screenHeight - pageY - height - (isKeyboardVisible ? keyboardHeight : 0) - insets.bottom;
        const requiredMenuSpace = 100;

        const placement = availableSpaceBelow < requiredMenuSpace ? 'top' : 'bottom';
        setMenuPlacement(placement);

        // Calculate max height for the modal based on screen position
        const maxModalHeight = Math.min(
          400, // Max limit
          screenHeight - 180 - (isKeyboardVisible ? keyboardHeight : 0)
        );
        setModalMaxHeight(maxModalHeight);

        setMenuPosition({
          x: pageX,
          y: pageY,
          width,
          height
        });

        setShowMenu(true);

        Animated.parallel([
          Animated.timing(blurAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(menuAnimation, {
            toValue: 1,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  }, [commentRef, screenHeight, isKeyboardVisible, keyboardHeight, insets.bottom, item.comment.length]);

  const closeMenu = useCallback(() => {
    Animated.parallel([
      Animated.timing(blurAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowMenu(false);
    });
  }, [blurAnimation, menuAnimation]);

  const handleReport = useCallback(() => {
    closeMenu();
  }, [item.id, closeMenu]);

  const handleBlock = useCallback(() => {
    closeMenu();
  }, [item.username, closeMenu]);

  // Rendering helpers
  const renderViewAllRepliesButton = useCallback((parentId: string, repliesCount: number) => (
    <View style={styles.viewAllRepliesContainer}>
      <View style={styles.lineHorizontal} />
      <Pressable
        style={styles.viewAllRepliesButton}
        onPress={() => handleShowAllReplies(parentId)}
      >
        <Text style={styles.viewAllRepliesText}>
          View all {repliesCount} replies
        </Text>
      </Pressable>
      <View style={styles.lineHorizontal} />
    </View>
  ), [styles, handleShowAllReplies]);

  const renderHideRepliesButton = useCallback((parentId: string, repliesCount: number) => {
    const parent = comments.find(comment => comment.id === parentId);

    if (!parent || !parent._showAllReplies || repliesCount <= 2) return null;

    return (
      <View style={styles.viewAllRepliesContainer}>
        <View style={styles.lineHorizontalInactive} />
        <Pressable
          style={styles.viewAllRepliesButton}
          onPress={() => handleShowAllReplies(parentId)}
        >
          <Text style={styles.viewAllRepliesTextInactive}>
            Hide replies
          </Text>
        </Pressable>
        <View style={styles.lineHorizontalInactive} />
      </View>
    );
  }, [styles, comments, handleShowAllReplies]);

  const renderReplyLine = useCallback(() => {
    if (item.isReply && index > 0 && flatComments[index - 1].isReply !== true) {
      return (
        <View style={[
          styles.replyLineContainer,
          {
            top: -(parentComment ? 16 : 32),
          }
        ]}>
          <View style={styles.replyCurve} />
        </View>
      );
    }
    return null;
  }, [item.isReply, index, flatComments, parentComment, styles]);

  // Render item for FlatList
  const renderFlatListItem = useCallback(() => {
    return (
      <View style={[
        styles.commentContainer,
        item.isReply && styles.replyContainer,

      ]}>
        {renderReplyLine()}

        <Image
          source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.username}` }}
          style={styles.avatar}
          priority="low"
          cachePolicy="memory-disk"
        />

        <CommentContent
          item={item}
          handleReply={handleReply}
          handleMentionPress={handleMentionPress}
          renderCommentText={renderCommentText}
          styles={styles}
          colors={colors}
          showMenu={showMenu}
          closeMenu={closeMenu}
        />

        <CommentActionsComponent
          item={item}
          onLike={handleLike}
          styles={styles}
          colors={colors}
        />
      </View>
    );
  }, [item, renderReplyLine, handleReply, handleMentionPress, renderCommentText, handleLike, styles, colors]);

  // Main render
  return (
    <>
      <View
        ref={ref => setCommentRef(ref)}
        onStartShouldSetResponder={() => true}
      >
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={100}
        >
          <View style={[
            styles.commentContainer,
            item.isReply && styles.replyContainer,
            { padding: 5, borderRadius: 8 }
          ]}>
            {renderReplyLine()}

            <Image
              source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.username}` }}
              style={styles.avatar}
              priority="low"
              cachePolicy="memory-disk"
            />

            <CommentContent
              item={item}
              handleReply={handleReply}
              handleMentionPress={handleMentionPress}
              renderCommentText={renderCommentText}
              styles={styles}
              colors={colors}
            />

            <CommentActionsComponent
              item={item}
              onLike={handleLike}
              styles={styles}
              colors={colors}
            />
          </View>
        </Pressable>

        {shouldShowViewAllButton && item.parentId &&
          renderViewAllRepliesButton(item.parentId, parentRepliesCount)}

        {shouldShowHideButton && item.parentId &&
          renderHideRepliesButton(item.parentId, parentRepliesCount)}
      </View>

      {showMenu && (
        <Portal>
          {/* Backdrop for closing the menu */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9,
              backgroundColor: 'transparent',
            }}
            activeOpacity={1}
            onPress={closeMenu}
          />
          
          {/* Blur background */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              opacity: blurAnimation,
            }}
            pointerEvents="none"
          >
            <BlurView
              style={{ flex: 1 }}
              intensity={10}
              experimentalBlurMethod="dimezisBlurView"
              tint={isDarkMode ? "systemThickMaterialDark" : "systemThinMaterialLight"}
            />
          </Animated.View>

          <View
            style={{
              position: 'absolute',
              top: isLongComment
                ? (screenHeight - modalMaxHeight) / 2 - (isKeyboardVisible ? keyboardHeight / 2 : 0)
                : menuPosition.y,
              left: isLongComment
                ? (screenWidth - Math.min(screenWidth * 0.9, 350)) / 2
                : menuPosition.x,
              width: isLongComment
                ? Math.min(screenWidth * 0.9, 350)
                : menuPosition.width,
              maxHeight: modalMaxHeight,
              backgroundColor: colors.background.primary,
              zIndex: 99999,
              elevation: 5,
              padding: 5,
              borderRadius: 8,
              overflow: 'hidden',

            }}
          >
            <FlatList
              data={[item]} // Pass item as single item in array
              renderItem={() => renderFlatListItem()}
              keyExtractor={() => item.id}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              initialNumToRender={1}
              maxToRenderPerBatch={1}
              overScrollMode="never"
              windowSize={1}
              style={{ maxHeight: modalMaxHeight }}
            />
          </View>

          {/* Context menu */}
          <ContextMenu
            showMenu={showMenu}
            menuPlacement={menuPlacement}
            menuPosition={isLongComment
              ? {
                // If long comment, position menu relative to centered modal
                x: (screenWidth - Math.min(screenWidth * 0.9, 350)) / 2,
                y: (screenHeight - modalMaxHeight) / 2 - (isKeyboardVisible ? keyboardHeight / 2 : 0),
                width: Math.min(screenWidth * 0.9, 350),
                height: modalMaxHeight
              }
              : menuPosition}
            menuAnimation={menuAnimation}
            handleReport={handleReport}
            handleBlock={handleBlock}
            closeMenu={closeMenu}
            colors={colors}
            screenDimensions={{ width: screenWidth, height: screenHeight }}
            isLongComment={isLongComment}
          />
        </Portal>
      )}
    </>
  );
};

export default CommentItemComponent; 