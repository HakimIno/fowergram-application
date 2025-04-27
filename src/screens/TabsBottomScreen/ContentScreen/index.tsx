import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { useTheme } from 'src/context/ThemeContext';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { ContentStorageService } from 'src/util/MMKVStorage';

import Header from './components/Header';
import ContentGrid from './components/ContentGrid';

import { calculateGridDimensions, generateGridData } from './utils/GridUtils';
import { GridItem } from './components/GridItem';

interface ContentScreenProps {
    navigation: NavigationProp<ParamListBase>;
}

const ContentScreen: React.FC<ContentScreenProps> = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [gridData, setGridData] = useState<GridItem[]>([]);
    
    // Shared value for header animation
    const scrollY = useSharedValue(0);

    // Memoize grid dimensions calculation to prevent recalculation
    const gridDimensions = useMemo(() => 
        calculateGridDimensions(gridData),
    [gridData]);

    // Function to load grid data from cache or generate new data
    const loadGridData = useCallback(async (forceRefresh = false) => {
        try {
            ContentStorageService.initialize();
            
            if (forceRefresh) {
                const newData = generateGridData();
                setGridData(newData);
                ContentStorageService.saveGridData(newData);
            } else {
                const cachedData = ContentStorageService.getGridData() as GridItem[] | null;
                
                if (cachedData && cachedData.length > 0) {
                    setGridData(cachedData);
                } else {
                    // Generate new data if no cached data exists
                    const newData = generateGridData();
                    setGridData(newData);
                    ContentStorageService.saveGridData(newData);
                }
            }
        } catch (error) {
            console.error('Error loading grid data:', error);
            const newData = generateGridData();
            setGridData(newData);
        }
    }, []);

    // JS function to handle refresh process
    const handleRefresh = useCallback(async () => {
        if (refreshing) return; // Prevent multiple refresh calls
        
        setRefreshing(true);
        await loadGridData(true); // Force refresh
        
        // Add slight delay to ensure UI updates properly
        setTimeout(() => {
            setRefreshing(false);
        }, 800);
    }, [loadGridData, refreshing]);

    // Handle pull-to-refresh action with worklet directive
    const onRefresh = useCallback(() => {
        'worklet';
        // Use runOnJS to call JS thread functions from worklet
        runOnJS(handleRefresh)();
    }, [handleRefresh]);

    // Initialize ContentStorageService and load cached data on mount
    useEffect(() => {
        let isMounted = true;
        
        const initializeData = async () => {
            if (!isMounted) return;
            
            setIsLoading(true);
            await loadGridData(false); // Don't force refresh on initial load
            
            if (isMounted) {
                setIsLoading(false);
            }
        };
        
        initializeData();
        
        // Clean up function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, [loadGridData]);

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            
            {/* Header */}
            <Header 
                onRefresh={onRefresh} 
                refreshing={refreshing}
                scrollY={scrollY}
            />
            
            {/* Content Grid with pull-to-refresh */}
            <View style={styles.gridContainer}>
                <ContentGrid
                    gridData={gridData}
                    gridDimensions={gridDimensions}
                    isLoading={isLoading}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                />
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    gridContainer: {
        flex: 1,
        marginTop: 60, // Space for header
    },
});

export default ContentScreen;
