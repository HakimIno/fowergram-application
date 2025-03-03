import { View, Text, TextInput, Pressable, Dimensions, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import React, { useState, useCallback, memo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TabView, TabBar, TabBarProps, Route } from 'react-native-tab-view';
import { useSharedValue } from 'react-native-reanimated';

const Tab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');

// Interfaces
interface StoryItem {
    id: string;
    title: string;
    image?: string;
    type?: 'search';
}

interface Post {
    id: string;
    image: string;
    title?: string;
    isVideo?: boolean;
    isStory?: boolean;
    likes?: number;
    comments?: number;
    duration?: number;
    views?: number;
}

interface StoryItemProps {
    item: StoryItem;
    index: number;
}

interface GridItemProps {
    item: Post;
    index: number;
}

interface TabContentProps {
    posts: Post[];
}

// Story Item Component
const StoryItem = memo(({ item, index }: StoryItemProps) => {
    if (item.type === 'search') {
        return (
            <Pressable style={[styles.storyItemContainer, index === 0 && styles.firstStoryMargin]}>
                <View style={styles.searchCircle}>
                    <Feather name="search" size={24} color="#666" />
                </View>
                <Text style={styles.storyTitle}>Search</Text>
            </Pressable>
        );
    }

    return (
        <Pressable style={[styles.storyItemContainer, index === 0 && styles.firstStoryMargin]}>
            <View style={styles.storyCircle}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.storyImage}
                />
            </View>
            <Text style={styles.storyTitle}>{item.title}</Text>
        </Pressable>
    );
});

const GridItem = memo(({ item, index }: GridItemProps) => {
    const baseSize = Math.floor(width / 3);
    const cycleIndex = Math.floor(index / 8);
    const position = index % 8;
    const isTallImageOnRight = cycleIndex % 2 === 1;

    // กำหนดให้รูปยาวเป็น video เสมอ
    if (position === 7) {
        item.isVideo = true;
        item.duration = item.duration || Math.floor(Math.random() * 180) + 30;
        item.views = item.views || Math.floor(Math.random() * 1000000);
    }

    const getItemStyle = () => {
        // รูปใหญ่ (2x2)
        if (position === 0) {
            return {
                width: baseSize * 2 - 1,
                height: baseSize * 2 - 1,
                margin: 0.5,
                borderRadius: 12,
            };
        }
        
        // รูปเล็กด้านขวาบน (1x1) 2 รูป
        if (position === 1 || position === 2) {
            return {
                width: baseSize - 1,
                height: baseSize - 1,
                margin: 0.5,
                borderRadius: 8,
            };
        }

        // รูปเล็กด้านล่าง (1x1) 4 รูป
        if (position >= 3 && position <= 6) {
            return {
                width: baseSize - 1,
                height: baseSize - 1,
                margin: 0.5,
                borderRadius: 8,
            };
        }
        
        // รูปสูง (1x2) - Video
        if (position === 7) {
            return {
                width: baseSize - 1,
                height: baseSize * 2 - 1,
                margin: 0.5,
                borderRadius: 12,
            };
        }

        return {
            width: baseSize - 1,
            height: baseSize - 1,
            margin: 0.5,
            borderRadius: 8,
        };
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <Pressable style={[styles.gridItem, getItemStyle()]}>
            <Image
                source={item.image}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
            />

            {/* Gradient Overlay - สำหรับทุกรูป */}
            <View style={styles.gradientOverlay} />

            {/* Content Overlays - สำหรับรูปใหญ่ */}
            {position === 0 && (
                <View style={styles.contentOverlay}>
                    <Text style={styles.contentTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={styles.engagementRow}>
                        <View style={styles.engagementBadge}>
                            <Ionicons name="heart" size={12} color="white" />
                            <Text style={styles.engagementText}>{formatNumber(item.likes || 0)}</Text>
                        </View>
                        <View style={styles.engagementBadge}>
                            <Ionicons name="chatbubble" size={12} color="white" />
                            <Text style={styles.engagementText}>{formatNumber(item.comments || 0)}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Video Indicators - สำหรับรูปยาว */}
            {position === 7 && (
                <>
                    <View style={styles.videoIndicator}>
                        <Ionicons name="play" size={20} color="white" />
                    </View>
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                            {Math.floor(item.duration! / 60)}:{(item.duration! % 60).toString().padStart(2, '0')}
                        </Text>
                    </View>
                    <View style={styles.viewsBadge}>
                        <Ionicons name="eye" size={12} color="white" />
                        <Text style={styles.viewsText}>{formatNumber(item.views!)}</Text>
                    </View>
                </>
            )}
        </Pressable>
    );
});

// ต้องอัปเดต TabContent component เพื่อรองรับการจัดเรียงใหม่
const TabContent = memo(({ posts }: TabContentProps) => {
    const getItemType = (index: number) => {
        const position = index % 8;
        if (position === 0) return 'large';
        if (position === 7) return 'tall';
        return 'normal';
    };

    const renderItem = ({ item, index }: { item: Post; index: number }) => (
        <GridItem item={item} index={index} />
    );

    return (
        <FlashList
            data={posts}
            renderItem={renderItem}
            estimatedItemSize={width / 3}
            numColumns={3}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            getItemType={(item, index) => getItemType(index)}
            overrideItemLayout={(layout, item, index) => {
                const baseSize = Math.floor(width / 3);
                const position = index % 8;
                const cycleIndex = Math.floor(index / 8);
                const isTallImageOnRight = cycleIndex % 2 === 1;

                if (position === 0) {
                    layout.span = 2;
                    layout.size = baseSize * 2;
                } else if (position === 1 || position === 2) {
                    layout.span = 1;
                    layout.size = baseSize;
                } else if (position >= 3 && position <= 6) {
                    layout.span = 1;
                    layout.size = baseSize;
                } else if (position === 7) {
                    layout.span = 1;
                    layout.size = baseSize * 2;
                }
            }}
        />
    );
});

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);


    const scrollY = useSharedValue(0);
    const lastScrollY = useSharedValue(0);
    const headerHeight = 60;

    const routes = [
        { key: 'forYou', title: 'For You' },
        { key: 'trending', title: 'Trending' },
        { key: 'food', title: 'Food' },
        { key: 'travel', title: 'Travel' },
        { key: 'fashion', title: 'Fashion' },
        { key: 'music', title: 'Music' },
    ];

    const posts: Post[] = Array(60).fill(null).map((_, index) => ({
        id: index.toString(),
        image: `https://picsum.photos/800/800?random=${index}`,
        likes: Math.floor(Math.random() * 10000),
        comments: Math.floor(Math.random() * 1000),
        isVideo: index === 0 || index % 5 === 0,
        duration: (index === 0 || index % 5 === 0) ? Math.floor(Math.random() * 180) + 30 : undefined,
        views: (index === 0 || index % 5 === 0) ? Math.floor(Math.random() * 1000000) : undefined,
    }));

    const renderTabBar = useCallback((props: TabBarProps<Route>) => (
        <TabBar
            {...props}
            scrollEnabled
            style={styles.tabBar}
            tabStyle={styles.tabItem}
            activeColor="#000"
            inactiveColor="#666"
            indicatorStyle={styles.tabIndicator}
            pressColor="transparent"
            pressOpacity={1}
            android_ripple={undefined}

        />
    ), []);
    // Render scene for each tab
    const renderScene = useCallback(({ route }: { route: { key: string } }) => {
        // Filter posts based on route if needed
        const filteredPosts = posts; // Add your filtering logic here
        return <TabContent posts={filteredPosts} />;
    }, [posts]);

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Header Section - Fixed */}
            <View style={styles.headerSection}>
                <View style={styles.searchHeader}>
                    <Pressable style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#666" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="ค้นหา"
                            placeholderTextColor="#666"
                            style={styles.searchInput}
                        />
                    </Pressable>
                </View>
            </View>

            {/* Tab View */}
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                initialLayout={{ width: layout.width }}
                lazy
                lazyPreloadDistance={1}
                swipeEnabled={true}
                overScrollMode="never"
                style={styles.tabView}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    tabView: {
        flex: 1,
    },
    tabBar: {
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
        height: 45,
        backgroundColor: 'white',
    },
    tabItem: {
        width: 'auto',
        paddingHorizontal: 10,
    },
    tabIndicator: {
        backgroundColor: '#000',
        height: 1.5,
    },
    tabLabel: {
        textTransform: 'none',
        fontSize: 10,
        fontWeight: '500',
        marginTop: 0,
        paddingTop: 0,
    },
    headerSection: {
        backgroundColor: 'white',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    searchHeader: {
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
        backgroundColor: 'white',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    searchBar: {
        flexDirection: 'row',
        backgroundColor: '#efefef',
        padding: 8,
        borderRadius: 10,
        alignItems: 'center'
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16
    },
    storiesContainer: {
        height: 100,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb'
    },
    storyItemContainer: {
        width: 75,
        marginRight: 8,
        alignItems: 'center'
    },
    firstStoryMargin: {
        marginLeft: 15
    },
    searchCircle: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center'
    },
    storyCircle: {
        padding: 3,
        borderRadius: 32.5,
        borderWidth: 2,
        borderColor: '#FF3366'
    },
    storyImage: {
        width: 60,
        height: 60,
        borderRadius: 30
    },
    storyTitle: {
        marginTop: 4,
        fontSize: 12,
        textAlign: 'center'
    },
    gridItem: {
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        borderWidth: 0.5,
        borderColor: '#dbdbdb',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    likesText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    popularBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#515BD4',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        width: '100%',
    },
    videoIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoDuration: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
    videoStats: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statsText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    specialItem: {
        borderRadius: 12,
        margin: 1,
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    videoInfo: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    engagementContainer: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
    },
    engagementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6,
        borderRadius: 20,
    },
    engagementText: {
        color: 'white',
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
    },
    contentOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    contentTitle: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    storyIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 4,
        borderRadius: 4,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    viewsBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.75)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    viewsText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    engagementRow: {
        flexDirection: 'row',
        gap: 8,
    },
    engagementBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
   
});

export default SearchScreen;