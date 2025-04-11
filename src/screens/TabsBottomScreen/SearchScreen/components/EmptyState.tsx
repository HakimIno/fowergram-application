import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { EmptyStateProps } from '../types';

const EmptyState = ({ isDarkMode, theme }: EmptyStateProps) => {
    const backgroundColor = isDarkMode ? theme?.backgroundColor || '#1a1a1a' : 'white';
    const textColor = isDarkMode ? theme?.textColor || '#FFFFFF' : '#333';
    const secondaryTextColor = isDarkMode ? '#999' : '#666';
    const iconColor = isDarkMode ? '#444' : '#ddd';
    const accentColor = theme?.primary || '#5271ff';

    return (
        <View style={[styles.emptyContainer, { backgroundColor }]}>
            <Ionicons name="search-outline" size={70} color={iconColor} />
            <Text style={[styles.emptyText, { color: textColor }]}>No results found</Text>
            <Text style={[styles.emptySubtext, { color: secondaryTextColor }]}>
                Try adjusting your search or browse trending content
            </Text>
            <View style={[styles.emptyActionButton, { backgroundColor: accentColor }]}>
                <Text style={[styles.emptyActionButtonText, { color: 'white' }]}>Browse Trending</Text>
            </View>
        </View>
    );
};

export default EmptyState; 