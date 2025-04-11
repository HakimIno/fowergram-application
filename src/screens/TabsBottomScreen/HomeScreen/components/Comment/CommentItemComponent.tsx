import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { CommentItem } from './types';
import CommentActionsComponent from './CommentActionsComponent';

interface CommentItemComponentProps {
  item: CommentItem;
  index: number;
  comments: CommentItem[];
  flatComments: CommentItem[];
  handleLike: (id: string, isReply: boolean) => void;
  handleShowAllReplies: (parentId: string) => void;
  handleMentionPress: (username: string) => void;
  handleHashtagPress: (tag: string) => void;
  handleLinkPress: (url: string) => void;
  renderCommentText: (text: string) => React.ReactNode;
  styles: any;
  colors: any;
}

const CommentItemComponent: React.FC<CommentItemComponentProps> = ({
  item,
  index,
  comments,
  flatComments,
  handleLike,
  handleShowAllReplies,
  renderCommentText,
  styles,
  colors
}) => {
  const isLiked = item.isLiked;
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

  const renderViewAllRepliesButton = useCallback((parentId: string, repliesCount: number) => {
    return (
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
    );
  }, [styles, handleShowAllReplies]);

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

  return (
    <>
      <View style={[
        styles.commentContainer,
        item.isReply && styles.replyContainer,
      ]}>
        {item.isReply && index > 0 && flatComments[index - 1].isReply !== true && (
          <View style={[
            styles.replyLineContainer,
            {
              top: -(parentComment ? 16 : 32),
            }
          ]}>
            <View style={styles.replyCurve} />
          </View>
        )}

        <Image source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.username}` }} style={styles.avatar} priority={"low"} cachePolicy={"memory-disk"} />

        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.time}>{item.time} ago</Text>
          </View>
          {renderCommentText(item.comment)}
        </View>

        <CommentActionsComponent
          item={item}
          onLike={handleLike}
          styles={styles}
          colors={colors}
        />
      </View>

      {shouldShowViewAllButton && item.parentId &&
        renderViewAllRepliesButton(item.parentId, parentRepliesCount)}

      {shouldShowHideButton && item.parentId &&
        renderHideRepliesButton(item.parentId, parentRepliesCount)}
    </>
  );
};

export default CommentItemComponent; 