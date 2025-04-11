import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { SearchSuggestionsProps } from '../types';

const SearchSuggestions = ({ onSuggestionPress, isDarkMode, theme }: SearchSuggestionsProps) => {
    const suggestions = ['Travel photos', 'Food recipes', 'Fashion trends', 'Music videos'];
    
    const backgroundColor = isDarkMode ? theme?.backgroundColor || '#1a1a1a' : 'white';
    const textColor = isDarkMode ? theme?.textColor || '#FFFFFF' : '#333';
    const secondaryTextColor = isDarkMode ? '#999' : '#666';
    
    return (
        <View style={[styles.searchSuggestions, { backgroundColor }]}>
            <Text style={[styles.suggestionsTitle, { color: textColor }]}>Try searching for</Text>
            {suggestions.map((suggestion, index) => (
                <Pressable
                    key={`suggestion-${index}`}
                    style={[styles.suggestionItem, isDarkMode && { borderBottomColor: '#333' }]}
                    onPress={() => onSuggestionPress(suggestion)}
                    android_ripple={{ color: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderless: false }}
                >
                    <Ionicons name="search-outline" size={18} color={secondaryTextColor} />
                    <Text style={[styles.suggestionText, { color: textColor }]}>{suggestion}</Text>
                </Pressable>
            ))}
        </View>
    );
};

export default SearchSuggestions; 