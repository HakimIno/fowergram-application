import React from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBarProps } from '../types';

const SearchBar = ({
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setIsSearchActive,
    onSearchSubmit,
    clearSearch,
    isDarkMode,
    theme
}: SearchBarProps) => {
    const { top } = useSafeAreaInsets();
    
    const backgroundColor = isDarkMode ? theme?.headerBackground || '#242424' : '#f5f5f5';
    const textColor = isDarkMode ? theme?.textColor || '#FFFFFF' : '#333';
    const placeholderColor = isDarkMode ? '#999' : '#666';
    const iconColor = isDarkMode ? '#999' : '#666';
    
    return (
        <View style={[styles.searchHeader, { paddingTop: top + 10 }]}>
            <View style={styles.searchBarContainer}>
                {isSearchActive && (
                    <Pressable style={styles.cancelButton} onPress={clearSearch}>
                        <Ionicons name="arrow-back" size={24} color={iconColor} />
                    </Pressable>
                )}
                <Pressable
                    style={[styles.searchBar, { backgroundColor }]}
                    onPress={() => setIsSearchActive(true)}
                    android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: true }}
                >
                    <Ionicons name="search" size={20} color={iconColor} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search"
                        placeholderTextColor={placeholderColor}
                        style={[styles.searchInput, { color: textColor }]}
                        onFocus={() => setIsSearchActive(true)}
                        onSubmitEditing={onSearchSubmit}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={iconColor} />
                        </Pressable>
                    )}
                </Pressable>
            </View>
        </View>
    );
};

export default SearchBar; 