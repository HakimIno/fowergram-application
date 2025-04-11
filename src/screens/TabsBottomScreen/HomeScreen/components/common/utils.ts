import { CommentType, CommentItem } from './types';

export const flattenComments = (commentsData: CommentType[]): CommentItem[] => {
  const flattened: CommentItem[] = [];

  commentsData.forEach(comment => {
    // Add parent comment with reply count
    flattened.push({
      ...comment,
      isReply: false,
      _replyCount: comment.replies.length,
      _shouldShowViewAllButton: false,
      _shouldShowHideButton: false
    });

    // Only add replies if this comment has replies
    if (comment.replies && comment.replies.length > 0) {
      // Get replies to show based on _showAllReplies flag
      const repliesToShow = comment._showAllReplies || comment.replies.length <= 2
        ? comment.replies
        : comment.replies.slice(0, 2);

      // Add each reply except the last one
      repliesToShow.slice(0, -1).forEach(reply => {
        flattened.push({
          ...reply,
          isReply: true,
          parentId: comment.id,
          _isLastReply: false,
          _shouldShowViewAllButton: false,
          _shouldShowHideButton: false
        });
      });

      // Add the last reply with special flags for buttons
      if (repliesToShow.length > 0) {
        const lastReply = repliesToShow[repliesToShow.length - 1];
        const hasMoreReplies = comment.replies.length > 2 && !comment._showAllReplies;
        const isExpanded = comment._showAllReplies && comment.replies.length > 2;

        flattened.push({
          ...lastReply,
          isReply: true,
          parentId: comment.id,
          _isLastReply: true,
          _shouldShowViewAllButton: hasMoreReplies,
          _shouldShowHideButton: isExpanded
        });
      }
    }
  });

  return flattened;
};

export interface TextSegment {
  type: 'text' | 'mention' | 'link' | 'hashtag';
  text: string;
  data?: {
    username?: string;
    url?: string;
    tag?: string;
  };
}

// Parse comment text to identify @mentions, #hashtags, and links
export function parseCommentText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentIndex = 0;

  // Regular expressions for detection
  const mentionRegex = /@(\w+)/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const hashtagRegex = /#(\w+)/g;
  
  // Temporary array to hold all matches
  const matches: Array<{
    type: 'mention' | 'link' | 'hashtag';
    match: string;
    index: number;
    length: number;
    data: { username?: string; url?: string; tag?: string };
  }> = [];
  
  // Find mentions
  let mentionMatch;
  while ((mentionMatch = mentionRegex.exec(text)) !== null) {
    matches.push({
      type: 'mention',
      match: mentionMatch[0],
      index: mentionMatch.index,
      length: mentionMatch[0].length,
      data: { username: mentionMatch[1] }
    });
  }
  
  // Find URLs
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    matches.push({
      type: 'link',
      match: urlMatch[0],
      index: urlMatch.index,
      length: urlMatch[0].length,
      data: { url: urlMatch[0] }
    });
  }
  
  // Find hashtags
  let hashtagMatch;
  while ((hashtagMatch = hashtagRegex.exec(text)) !== null) {
    matches.push({
      type: 'hashtag',
      match: hashtagMatch[0],
      index: hashtagMatch.index,
      length: hashtagMatch[0].length,
      data: { tag: hashtagMatch[1] }
    });
  }
  
  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);
  
  // Process text with matches
  for (const match of matches) {
    if (match.index > currentIndex) {
      // Add plain text before the match
      segments.push({
        type: 'text',
        text: text.substring(currentIndex, match.index)
      });
    }
    
    // Add the match
    segments.push({
      type: match.type,
      text: match.match,
      data: match.data
    });
    
    currentIndex = match.index + match.length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      type: 'text',
      text: text.substring(currentIndex)
    });
  }
  
  return segments;
}

export const findCommentIndex = (comments: CommentItem[], targetId: string): number => {
  return comments.findIndex(comment => comment.id === targetId);
}; 