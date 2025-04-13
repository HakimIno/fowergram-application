import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuggestionsListComponentProps {
  mentionSuggestions: Array<{ username: string, avatar: string }>;
  hashtagSuggestions: string[];
  handleSelectMention: (username: string) => void;
  handleSelectHashtag: (tag: string) => void;
  styles: any;
}

const SuggestionsListComponent: React.FC<SuggestionsListComponentProps> = ({
  mentionSuggestions,
  hashtagSuggestions,
  handleSelectMention,
  handleSelectHashtag,
  styles,
}) => {
  if (mentionSuggestions.length === 0 && hashtagSuggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.suggestionsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.suggestionsScroll}
      >
        {mentionSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={`mention-${index}`}
            style={styles.suggestionItem}
            onPress={() => handleSelectMention(suggestion.username)}
          >
            <Image
              source={{ uri: suggestion.avatar }}
              style={styles.suggestionAvatar}
            />
            <Text style={styles.suggestionText}>@{suggestion.username}xx</Text>
          </TouchableOpacity>
        ))}
        
        {hashtagSuggestions.map((tag, index) => (
          <TouchableOpacity
            key={`hashtag-${index}`}
            style={styles.suggestionItem}
            onPress={() => handleSelectHashtag(tag)}
          >
            <View style={styles.hashtagIcon}>
              <Text style={styles.hashtagIconText}>#</Text>
            </View>
            <Text style={styles.suggestionText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SuggestionsListComponent; 