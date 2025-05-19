import { StyleSheet, View, Platform, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import React, { useCallback, useMemo, memo } from 'react';
import Animated from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'src/navigation/types';
import GridItem, { FeedInfo } from './GridItem';
import { width, height } from './constants';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';

type TabContentProps = {
    navigation: StackNavigationProp<RootStackParamList, "profile_details_screen">;
    scrollHandler: any;
    feed: FeedInfo[];
    isLoading: boolean;
    headerHeight: number;
};

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<FeedInfo>);

// GPU speedup
const isAndroid = Platform.OS === 'android';

// Optimized list configuration
const SCROLL_EVENT_THROTTLE = 16; // ~60fps
const VIEWPORT_PREFETCH = 2; // Fetch 2 screens worth of content

const MemoizedGridItem = memo(GridItem);

const TabContent: React.FC<TabContentProps> = ({
    navigation,
    scrollHandler,
    feed,
    isLoading,
    headerHeight
}) => {
    const itemSize = useMemo(() => width / 3 - 1, []);
    const itemHeight = useMemo(() => itemSize * 1.4, [itemSize]);

    const handlePress = useCallback((index: number) => {
        navigation.navigate("gallery_screen", {
            index,
            feed
        });
    }, [navigation, feed]);

    const renderItem = useCallback(({ item, index }: ListRenderItemInfo<FeedInfo>) => (
        <MemoizedGridItem
            item={item}
            index={index}
            onPress={handlePress}
            size={itemSize}
        />
    ), [itemSize, handlePress]);

    const keyExtractor = useCallback((item: FeedInfo) => item.id, []);

    const estimatedItemSize = useMemo(() => itemHeight, [itemHeight]);
    
    // Pre-compute item layout for performance - not using it directly
    // but keeping calculation for reference
    const calculatedItemHeight = useMemo(() => {
        return (index: number) => ({
            length: itemHeight,
            offset: itemHeight * Math.floor(index / 3),
            index,
        })
    }, [itemHeight]);

    return (
        <View style={[styles.container, isAndroid && styles.androidOptimize]}>
            <View style={styles.listContainer}>
                <AnimatedFlashList
                    data={feed}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    numColumns={3}
                    onScroll={scrollHandler}
                    scrollEventThrottle={SCROLL_EVENT_THROTTLE}
                    showsVerticalScrollIndicator={false}
                    estimatedItemSize={estimatedItemSize}
                    bounces={Platform.OS === 'ios'}
                    overScrollMode={"never" as const}
                    viewabilityConfig={{
                        minimumViewTime: 300,
                        viewAreaCoveragePercentThreshold: 20,
                    }}
                    estimatedListSize={{
                        width,
                        height: height * 2,
                    }}
                    drawDistance={VIEWPORT_PREFETCH * height}
                    removeClippedSubviews={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    androidOptimize: {
        elevation: 0.1,
    },
    listContainer: {
        flex: 1,
        backgroundColor: 'white',
        overflow: 'hidden'
    },
});

// Memoize the entire component for optimal performance
export default memo(TabContent); 