import React from 'react';
import { Text } from 'react-native';
import { parseCommentText } from './utils';

interface CommentTextComponentProps {
  text: string;
  handleMentionPress: (username: string) => void;
  handleHashtagPress: (tag: string) => void;
  handleLinkPress: (url: string) => void;
  styles: any;
  colors: any;
}

const CommentTextComponent: React.FC<CommentTextComponentProps> = ({
  text,
  handleMentionPress,
  handleHashtagPress,
  handleLinkPress,
  styles,
  colors
}) => {
  const segments = parseCommentText(text);

  return (
    <Text style={styles.commentText}>
      {segments.map((segment, index) => {
        if (segment.type === 'mention' && segment.data?.username) {
          const username = segment.data.username;
          return (
            <Text
              key={`mention-${index}`}
              onPress={() => handleMentionPress(username)}
              style={{ color: colors.primary }}
            >
              {segment.text}
            </Text>
          );
        }

        if (segment.type === 'hashtag' && segment.data?.tag) {
          const tag = segment.data.tag;
          return (
            <Text
              key={`hashtag-${index}`}
              onPress={() => handleHashtagPress(tag)}
              style={{ color: colors.primary }}
            >
              {segment.text}
            </Text>
          );
        }

        if (segment.type === 'link' && segment.data?.url) {
          const url = segment.data.url;
          return (
            <Text
              key={`link-${index}`}
              onPress={() => handleLinkPress(url)}
              style={{ color: colors.primary }}
            >
              {segment.text}
            </Text>
          );
        }

        return <Text key={`text-${index}`}>{segment.text}</Text>;
      })}
    </Text>
  );
};

export default CommentTextComponent; 