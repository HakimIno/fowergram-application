export interface Post {
    id: string;
    image: string;
    title?: string;
    isVideo?: boolean;
    likes?: number;
    comments?: number;
    duration?: number;
    views?: number;
    category?: string;
    trending?: boolean;
    trendingRank?: number;
}

export interface Route {
    key: string;
    title: string;
}

// Import Theme type from ThemeContext
import { Theme } from 'src/context/ThemeContext';

export interface TabContentProps {
    posts: Post[];
    category: string;
    onRefresh?: () => void;
    refreshing?: boolean;
    onEndReached?: () => void;
    isDarkMode?: boolean;
    theme?: Theme;
}

export interface SearchSuggestionsProps {
    onSuggestionPress: (suggestion: string) => void;
    isDarkMode?: boolean;
    theme?: Theme;
}

export interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearchActive: boolean;
    setIsSearchActive: (active: boolean) => void;
    onSearchSubmit: () => void;
    clearSearch: () => void;
    isDarkMode?: boolean;
    theme?: Theme;
}

export interface CustomTabBarProps {
    props: any; // Adjust based on actual type
    isLoadingMore: boolean;
    refreshing: boolean;
    isDarkMode?: boolean;
    theme?: Theme;
}

export interface EmptyStateProps {
    isDarkMode?: boolean;
    theme?: Theme;
}

export interface GridItemProps {
    item: {
        image: string;
        title?: string;
        likes?: number;
        comments?: number;
        views?: number;
        duration?: number;
        isVideo?: boolean;
        trending?: boolean;
    };
    index: number;
    gridWidth: number;
    groupIndex: number;
    layout?: 'large' | 'small';
    isVisible?: boolean;
    isDarkMode?: boolean;
    theme?: Theme;
} 