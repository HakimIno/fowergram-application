import React, { memo, useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import GridItem from './GridItem';
import EmptyState from './EmptyState';
import { TabContentProps } from '../types';
import ActivityIndicator from 'src/components/ActivityIndicator';

const TabContent = memo(({ 
    posts, 
    category, 
    onRefresh, 
    refreshing, 
    onEndReached,
    isDarkMode,
    theme
}: TabContentProps) => {
    const { width: screenWidth } = useWindowDimensions();
    const gap = 1; // ระยะห่างระหว่างกริด - ต้องตรงกับค่าใน GridItem

    const filteredPosts = useMemo(() =>
        category === 'all'
            ? posts
            : posts.filter(post => post.category === category || (category === 'trending' && post.trending))
        , [posts, category]);

    // Group posts into 5-item groups for 3x2 grid layout
    const groupedPosts = useMemo(() => {
        const groups = [];
        for (let i = 0; i < filteredPosts.length; i += 5) {
            const group = filteredPosts.slice(i, i + 5);
            if (group.length === 5) {  // Only use complete groups of 5
                groups.push(group);
            }
        }
        return groups;
    }, [filteredPosts]);

    // Calculate height for each 3x2 grid group - ปรับการคำนวณให้ตรงกับ GridItem
    const standardWidth = (screenWidth / 3) - (gap * 2 / 3); // เหมือนกับใน GridItem
    const gridHeight = (standardWidth * 2) + gap; // ความสูงเท่ากับกริดขนาดใหญ่ (2 rows + gap)

    const backgroundColor = isDarkMode ? theme?.backgroundColor || '#1a1a1a' : 'white';
    const textColor = isDarkMode ? theme?.textColor || '#FFFFFF' : '#333';
    const accentColor = theme?.primary || '#4f46e5';

    return (
        <View style={[styles.gridContainer, { flex: 1, backgroundColor }]}>
            {filteredPosts.length === 0 ? (
                <EmptyState isDarkMode={isDarkMode} theme={theme} />
            ) : (
                <FlashList
                    data={groupedPosts}
                    renderItem={({ item: group, index: groupIndex }) => (
                        <View
                            style={{
                                height: gridHeight,
                                width: screenWidth,
                                marginBottom: gap, // ใช้ gap เดียวกัน
                                position: 'relative',
                                backgroundColor
                            }}
                        >
                            {group.map((post, postIndex) => (
                                <GridItem
                                    key={post.id}
                                    item={post}
                                    index={postIndex}
                                    groupIndex={groupIndex}
                                    gridWidth={screenWidth}
                                    isDarkMode={isDarkMode}
                                    theme={theme}
                                />
                            ))}
                        </View>
                    )}
                    estimatedItemSize={gridHeight}
                    keyExtractor={(item, index) => `group-${index}`}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{
                        paddingBottom: 80,
                    }}
                    ListHeaderComponent={
                        category === 'trending' ? (
                            <View style={[styles.trendingHeader, { backgroundColor }]}>
                                <Text style={[styles.trendingHeaderTitle, { color: textColor }]}>Explore Trending Content</Text>
                                <Text style={[styles.trendingHeaderSubtitle, { color: isDarkMode ? '#999' : '#666' }]}>
                                    Discover what's popular right now
                                </Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        <View style={[styles.loadingFooter, { backgroundColor }]}>
                            <ActivityIndicator size={20} />
                        </View>
                    }
                    removeClippedSubviews={true}
                />
            )}
        </View>
    );
});

export default TabContent; 