import { CommentItem, TextSegment } from './types';

export const flattenComments = (comments: CommentItem[]): CommentItem[] => {
  const flattenedComments: CommentItem[] = [];
  
  comments.forEach(comment => {
    flattenedComments.push(comment);
    
    if (comment.replies && comment.replies.length > 0) {
      // Make sure replies are sorted by creation time (oldest first)
      // This is simplified - in real app you'd parse timestamps properly
      const sortedReplies = [...comment.replies].sort((a, b) => {
        // If both have 'now', maintain original order
        if (a.time === 'now' && b.time === 'now') return 0; 
        if (a.time === 'now') return 1; // Put newer replies at the end
        if (b.time === 'now') return -1;
        return a.time.localeCompare(b.time);
      });
      
      // If _showAllReplies is true, add all replies
      // Otherwise add only the first 2 replies
      const repliesToAdd = comment._showAllReplies 
        ? sortedReplies 
        : sortedReplies.slice(0, Math.min(2, sortedReplies.length));
        
      flattenedComments.push(...repliesToAdd);
    }
  });
  
  return flattenedComments;
};

export const parseCommentText = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let currentIndex = 0;
  
  // Match @mentions, #hashtags, and URLs
  const pattern = /(?:^|\s)(@([a-zA-Z0-9._]+))|(?:^|\s)(#([a-zA-Z0-9_]+))|(?:^|\s)((https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/[a-zA-Z0-9-_.~!*'();:@&=+$,\/?#[\]]*)?)/g;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const matchStart = match.index + (match[0].startsWith(' ') ? 1 : 0);
    
    // Add regular text before the match
    if (matchStart > currentIndex) {
      segments.push({
        type: 'text' as const,
        text: text.substring(currentIndex, matchStart)
      });
    }
    
    // Add mention
    if (match[1]) {
      segments.push({
        type: 'mention' as const,
        text: match[1],
        data: { username: match[2] }
      });
    } 
    // Add hashtag
    else if (match[3]) {
      segments.push({
        type: 'hashtag' as const,
        text: match[3],
        data: { tag: match[4] }
      });
    }
    // Add URL
    else if (match[5]) {
      segments.push({
        type: 'link' as const,
        text: match[5],
        data: { url: match[5].startsWith('http') ? match[5] : `http://${match[5]}` }
      });
    }
    
    currentIndex = matchStart + match[0].substr(match[0].startsWith(' ') ? 1 : 0).length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      type: 'text' as const,
      text: text.substring(currentIndex)
    });
  }
  
  return segments;
};

export const findCommentIndex = (comments: CommentItem[], id: string): number => {
  return comments.findIndex(comment => comment.id === id);
}; 