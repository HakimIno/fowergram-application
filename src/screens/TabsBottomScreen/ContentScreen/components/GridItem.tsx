import React, { useRef, useState, useEffect, memo } from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Animated from 'react-native-reanimated';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'src/navigation/types';
import { Dimensions } from 'react-native';

// Default blur hash for image placeholders - optimized for performance
const DEFAULT_BLURHASH =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// TypeScript interfaces
export interface GridItem {
    id: string;
    imageUrl: string;
    tag: string;
    left: number;
    top: number;
    width: number;
    height: number;
    isLarge: boolean;
    isXLarge: boolean;
}

interface GridItemProps {
    item: GridItem;
}

const GridItemComponent: React.FC<GridItemProps> = memo(({ item }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const itemRef = useRef<View>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Add visibility tracking for better performance
    useEffect(() => {
        // Immediate visibility for items in initial viewport, delayed for others
        const isPotentiallyVisible = 
            item.left < SCREEN_WIDTH && 
            item.top < SCREEN_HEIGHT && 
            item.left + item.width > 0 && 
            item.top + item.height > 0;
        
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, isPotentiallyVisible ? 50 : 300);
        
        return () => clearTimeout(timer);
    }, []);

    const handlePress = () => {
        if (!item.imageUrl || !item.id) {
            console.warn('Invalid item data:', item);
            return;
        }
        
        // Only allow navigation if image is loaded
        if (imageLoaded) {
            navigation.navigate('image_viewer_modal', {
                imageUrl: item.imageUrl,
                imageId: item.id,
                username: "kimsnow",
                isFollowing: false
            });
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <TouchableOpacity
            style={[
                styles.gridItem,
                {
                    width: item.width,
                    height: item.height,
                    left: item.left,
                    top: item.top,
                },
            ]}
            activeOpacity={0.9}
            onPress={handlePress}
            ref={itemRef}
        >
            <Animated.View
                style={styles.imageContainer}
                // Only use sharedTransitionTag when item is visible and loaded
                sharedTransitionTag={isVisible && imageLoaded ? `image-${item.id}` : undefined}
            >
                <ExpoImage
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    placeholder={DEFAULT_BLURHASH}
                    placeholderContentFit="cover"
                    contentPosition="center"
                    priority={isVisible ? "high" : "low"}
                    transition={300}
                    onLoad={handleImageLoad}
                    recyclingKey={item.id}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}, (prevProps, nextProps) => {
    // Optimize re-renders - only re-render if these props change
    return (
        prevProps.item.id === nextProps.item.id &&
        prevProps.item.imageUrl === nextProps.item.imageUrl &&
        prevProps.item.width === nextProps.item.width &&
        prevProps.item.height === nextProps.item.height &&
        prevProps.item.left === nextProps.item.left &&
        prevProps.item.top === nextProps.item.top
    );
});

// Get screen dimensions for visibility calculation
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
    gridItem: {
        position: 'absolute',
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'transparent',
        borderRadius: 6,
        margin: 0,
        // Add hardware acceleration for better scrolling performance
        ...Platform.select({
            ios: {
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    itemImage: {
        width: '100%',
        height: '100%',
        borderRadius: 6,
    },
});

export default GridItemComponent; 