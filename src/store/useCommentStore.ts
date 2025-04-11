import { create } from 'zustand';
import { MOCK_COMMENTS } from 'src/screens/TabsBottomScreen/HomeScreen/components/common';

export interface Reply {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replyTo?: string; // username of the person being replied to
  reaction?: string; // Add reaction field
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  comment: string;
  time: string;
  likes: number;
  isLiked: boolean;
  replies: Reply[];
  _showAllReplies?: boolean;
  reaction?: string; // Add reaction field
}

interface CommentState {
  comments: Comment[];
  addComment: (comment: Comment) => void;
  addReply: (parentId: string, reply: Reply) => void;
  toggleLike: (commentId: string, isReply?: boolean, reaction?: string) => void;
  toggleShowAllReplies: (parentId: string) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: MOCK_COMMENTS,
  
  addComment: (comment) => 
    set((state) => ({ 
      comments: [comment, ...state.comments] 
    })),
    
  addReply: (parentId, reply) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ),
    })),
    
  toggleLike: (commentId, isReply = false, reaction) =>
    set((state) => ({
      comments: state.comments.map((comment) => {
        if (isReply) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                const newIsLiked = !reply.isLiked;
                return { 
                  ...reply, 
                  isLiked: newIsLiked,
                  likes: newIsLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1),
                  reaction: newIsLiked ? reaction : undefined
                };
              }
              return reply;
            }),
          };
        }
        
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          return { 
            ...comment, 
            isLiked: newIsLiked,
            likes: newIsLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
            reaction: newIsLiked ? reaction : undefined
          };
        }
        return comment;
      }),
    })),
    
  toggleShowAllReplies: (parentId) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === parentId
          ? { ...comment, _showAllReplies: !comment._showAllReplies }
          : comment
      ),
    })),
})); 