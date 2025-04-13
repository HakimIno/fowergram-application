import { create } from 'zustand';
import { CommentItem } from 'src/screens/TabsBottomScreen/HomeScreen/components/Comment/types';

interface CommentState {
  comments: CommentItem[];
  addComment: (comment: CommentItem) => void;
  addReply: (parentId: string, reply: CommentItem) => Promise<void>;
  toggleLike: (id: string, isReply: boolean) => void;
  toggleShowAllReplies: (parentId: string) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  
  addComment: (comment) => {
    set((state) => ({
      comments: [comment, ...state.comments]
    }));
  },
  
  addReply: async (parentId, reply) => {
    console.log('Adding reply in store to parent:', parentId, reply);
    
    return new Promise<void>((resolve) => {
      set((state) => {
        // Find if we need to reply to a comment or to a reply
        let isReplyToReply = false;
        let topLevelCommentId = '';
        
        // First search if parentId is a top-level comment
        const parentComment = state.comments.find(c => c.id === parentId);
        
        if (parentComment) {
          // Case 1: Replying to a top-level comment
          topLevelCommentId = parentId;
        } else {
          // Case 2: Replying to a reply, need to find its parent comment
          isReplyToReply = true;
          
          // Search all comments to find which one contains this reply
          for (const comment of state.comments) {
            if (comment.replies) {
              const replyExists = comment.replies.some(r => r.id === parentId);
              if (replyExists) {
                topLevelCommentId = comment.id;
                break;
              }
            }
          }
        }
        
        if (!topLevelCommentId) {
          console.error("Could not find parent for reply", parentId);
          return { comments: state.comments }; // No change if parent not found
        }
        
        // Now add the reply to the correct top-level comment
        const updatedComments = state.comments.map(comment => {
          if (comment.id === topLevelCommentId) {
            // Prepare the enriched reply
            const enrichedReply = {
              ...reply,
              isReply: true,
              parentId: topLevelCommentId,
              ...(isReplyToReply && { replyingToReplyId: parentId })
            };
            
            return {
              ...comment,
              replies: [...(comment.replies || []), enrichedReply]
            };
          }
          return comment;
        });
        
        return { comments: updatedComments };
      });
      
      // Artificial delay to simulate API call
      setTimeout(resolve, 100);
    });
  },
  
  toggleLike: (id, isReply) => {
    set((state) => {
      if (!isReply) {
        // Toggle like on a top-level comment
        const updatedComments = state.comments.map((comment) => {
          if (comment.id === id) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            };
          }
          return comment;
        });
        return { comments: updatedComments };
      } else {
        // Toggle like on a reply
        const updatedComments = state.comments.map((comment) => {
          if (comment.replies) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === id) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                };
              }
              return reply;
            });
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          return comment;
        });
        return { comments: updatedComments };
      }
    });
  },
  
  toggleShowAllReplies: (parentId) => {
    set((state) => {
      const updatedComments = state.comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            _showAllReplies: !comment._showAllReplies
          };
        }
        return comment;
      });
      return { comments: updatedComments };
    });
  }
})); 