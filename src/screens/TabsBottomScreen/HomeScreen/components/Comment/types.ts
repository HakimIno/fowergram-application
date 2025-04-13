export interface ReplyType {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replyTo?: string;
}

export interface CommentType {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies: ReplyType[];
  _showAllReplies?: boolean;
}

export interface CommentItem {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  time: string;
  likes: number;
  isLiked: boolean;
  isReply?: boolean;
  replyTo?: string;
  parentId?: string;
  replyingToReplyId?: string;
  replies?: CommentItem[];
  _showAllReplies?: boolean;
}

export interface TextSegment {
  type: 'text' | 'mention' | 'hashtag' | 'link';
  text: string;
  data?: {
    username?: string;
    tag?: string;
    url?: string;
  };
}

export interface CommentBottomSheetProps {
  handleClose: () => void;
  commentsCount: number;
} 