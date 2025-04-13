import { View, useWindowDimensions } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { TabView, SceneRendererProps, NavigationState } from '../../../components/TabView';
import Animated, { useAnimatedStyle, useSharedValue, interpolate } from 'react-native-reanimated';
import { styles } from './styles';
import { Post, Route } from './types';
import { generatePosts } from './utils';

// Import components
import TabContent from './components/TabContent';
import SearchBar from './components/SearchBar';
import SearchSuggestions from './components/SearchSuggestions';
import CustomTabBar from './components/CustomTabBar';
import { useTheme } from 'src/context/ThemeContext';

const SearchScreen = () => {
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [index, setIndex] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [page, setPage] = useState(1);
    const { isDarkMode, theme } = useTheme();

    // Refs and animations
    const scrollY = useSharedValue(0);
    const { width: screenWidth } = useWindowDimensions();
    
    // Constants
    const pageSize = 20; 
    const routes: Route[] = [
        { key: 'forYou', title: 'For You' },
        { key: 'trending', title: 'Trending' },
        { key: 'food', title: 'Food' },
        { key: 'travel', title: 'Travel' },
        { key: 'fashion', title: 'Fashion' },
        { key: 'music', title: 'Music' },
    ];

    // Initialize posts
    const [posts, setPosts] = useState<Post[]>(() => generatePosts(routes, 0, pageSize));

    // Handlers
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || !hasMorePosts) return;

        setIsLoadingMore(true);

        // Simulate network request
        setTimeout(() => {
            const startIndex = page * pageSize * 5; // 5 posts per group
            const newPosts = generatePosts(routes, startIndex, pageSize);

            if (newPosts.length === 0) {
                setHasMorePosts(false);
            } else {
                setPosts(prevPosts => [...prevPosts, ...newPosts]);
                setPage(prevPage => prevPage + 1);
            }

            setIsLoadingMore(false);
        }, 1000);
    }, [page, isLoadingMore, hasMorePosts, routes, pageSize]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setPosts(generatePosts(routes, 0, pageSize));
            setPage(1);
            setHasMorePosts(true);
            setRefreshing(false);
        }, 1500);
    }, [routes, pageSize]);

    const handleSearchSubmit = useCallback(() => {
        if (searchQuery.trim()) {
            setIsSearchActive(true);
        }
    }, [searchQuery]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setIsSearchActive(false);
    }, []);

    const handleSuggestionPress = useCallback((suggestion: string) => {
        setSearchQuery(suggestion);
    }, []);

    // Animation
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.value, [0, 50], [1, 0]),
    }));

    // Custom render functions
    const renderTabBar = useCallback((props: SceneRendererProps & { navigationState: NavigationState<Route> }) => (
        <CustomTabBar 
            props={props} 
            isLoadingMore={isLoadingMore} 
            refreshing={refreshing}
            isDarkMode={isDarkMode}
            theme={theme}
        />
    ), [isLoadingMore, refreshing, isDarkMode, theme]);

    const renderSearchResults = useCallback(() => {
        if (searchQuery.length > 0) {
            return (
                <TabContent
                    posts={posts.filter(post =>
                        post.title?.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    category="all"
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    isDarkMode={isDarkMode}
                    theme={theme}
                />
            );
        }
        
        return (
            <SearchSuggestions 
                onSuggestionPress={handleSuggestionPress}
                isDarkMode={isDarkMode}
                theme={theme}
            />
        );
    }, [searchQuery, posts, handleRefresh, refreshing, handleLoadMore, handleSuggestionPress, isDarkMode, theme]);

    const renderMainContent = useCallback(() => {
        if (isSearchActive) {
            return (
                <View style={[styles.resultsContainer, { backgroundColor: theme.backgroundColor }]}>
                    {renderSearchResults()}
                </View>
            );
        }

        return (
            <View style={[styles.mainContent, { backgroundColor: theme.backgroundColor }]}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={({ route }) => (
                        <TabContent
                            posts={posts}
                            category={route.key}
                            onRefresh={handleRefresh}
                            refreshing={refreshing}
                            onEndReached={handleLoadMore}
                            isDarkMode={isDarkMode}
                            theme={theme}
                        />
                    )}
                    renderTabBar={renderTabBar}
                    onIndexChange={setIndex}
                    initialLayout={{ width: screenWidth }}
                    style={[styles.tabView, { backgroundColor: theme.backgroundColor }]}
                    lazy
                    lazyPreloadDistance={1}
                    overScrollMode="never"
                />
            </View>
        );
    }, [
        isSearchActive, 
        renderSearchResults,
        index, 
        routes, 
        posts, 
        handleRefresh, 
        refreshing, 
        handleLoadMore, 
        renderTabBar, 
        screenWidth,
        isDarkMode,
        theme
    ]);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            <Animated.View style={[styles.headerSection, isSearchActive ? { opacity: 1 } : headerAnimatedStyle]}>
                <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    isSearchActive={isSearchActive}
                    setIsSearchActive={setIsSearchActive}
                    onSearchSubmit={handleSearchSubmit}
                    clearSearch={clearSearch}
                    isDarkMode={isDarkMode}
                    theme={theme}
                />
            </Animated.View>
            {renderMainContent()}
        </View>
    );
};

export default SearchScreen; 