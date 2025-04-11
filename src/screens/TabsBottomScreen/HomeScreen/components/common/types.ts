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
  parentId?: string;
  replies?: ReplyType[];
  _showAllReplies?: boolean;
  _replyCount?: number;
  _isLastReply?: boolean;
  _shouldShowViewAllButton?: boolean;
  _shouldShowHideButton?: boolean;
  replyTo?: string;
}

export interface CommentBottomSheetProps {
  handleClose: () => void;
  commentsCount: number;
} 