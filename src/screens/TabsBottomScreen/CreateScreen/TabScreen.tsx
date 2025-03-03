import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { memo, useCallback, useRef } from "react";
import { ActivityIndicator, Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setSelectPhotos } from "src/redux-store/slices/mediaSlice";
import * as MediaLibrary from 'expo-media-library';
import { RootState } from "src/redux-store";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const IMAGE_WIDTH = width / COLUMN_COUNT - 2;
const IMAGE_HEIGHT = 200;

type TabScreenProps = {
    photos: MediaLibrary.Asset[];
    onLoadMore?: () => void;
    loading?: boolean;
};

const secondsToMinutes = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toFixed(0).padStart(2, '0')}`;
};

const ImageOverlay = memo(({ selectedIndex }: { selectedIndex: number }) => (
    <View style={styles.imageOverlay}>
        <View style={styles.selectedIndexContainer}>
            <Text style={styles.selectedIndexText}>{selectedIndex}</Text>
        </View>
    </View>
));

const PhotoItem = memo(({ item, isSelected, selectedIndex, onPress }: {
    item: MediaLibrary.Asset;
    isSelected: boolean;
    selectedIndex: number;
    onPress: () => void;
}) => (
    <Pressable
        onPress={onPress}
        style={[styles.image, isSelected && styles.selectedImage]}
    >
        <Image
            style={styles.imageContent}
            source={{ uri: item.uri }}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={item.id}
        />
        {isSelected ? (
            <ImageOverlay selectedIndex={selectedIndex} />
        ) : (
            <View style={styles.unselectedCountContainerStyle} />
        )}

        <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
                {item.duration ? secondsToMinutes(item.duration) : ''}
            </Text>
        </View>
    </Pressable>
));

const SelectedPhotoItem = memo(({ item, onPress }: {
    item: MediaLibrary.Asset;
    onPress: () => void;
}) => (
    <View style={styles.selectedPhotoContainer}>
        <Image
            style={styles.selectedPhotoImage}
            source={{ uri: item.uri }}
            contentFit="cover"
            cachePolicy="memory-disk"
            recyclingKey={item.id}
        />
        <Pressable
            style={styles.closeButton}
            onPress={onPress}
        >
            <Ionicons name="close" size={16} color="white" />
        </Pressable>
    </View>
));

const TabScreen: React.FC<TabScreenProps> = memo(({ photos, onLoadMore, loading }) => {
    const dispatch = useDispatch();
    const selectedPhotos = useSelector((state: RootState) => state.medias.selectedPhotos);
    const listRef = useRef<FlashList<any>>(null);

    const scrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!loading && onLoadMore) {
            onLoadMore();
        }
    }, [loading, onLoadMore]);

    const toggleSelectPhoto = useCallback((item: MediaLibrary.Asset) => {
        dispatch(setSelectPhotos(
            selectedPhotos.some(photo => photo.id === item.id)
                ? selectedPhotos.filter(photo => photo.id !== item.id)
                : [...selectedPhotos, item]
        ));
    }, [dispatch, selectedPhotos]);

    const renderItem = useCallback(({ item }: { item: MediaLibrary.Asset }) => {
        const isSelected = selectedPhotos.some(photo => photo.id === item.id);
        const selectedIndex = selectedPhotos.findIndex(photo => photo.id === item.id) + 1;
        return (
            <PhotoItem
                item={item}
                isSelected={isSelected}
                selectedIndex={selectedIndex}
                onPress={() => toggleSelectPhoto(item)}
            />
        );
    }, [selectedPhotos, toggleSelectPhoto]);

    const renderSelectedPhoto = useCallback(({ item }: { item: MediaLibrary.Asset }) => (
        <SelectedPhotoItem
            item={item}
            onPress={() => toggleSelectPhoto(item)}
        />
    ), [toggleSelectPhoto]);

    const renderFooter = useCallback(() => (
        loading ? <ActivityIndicator style={styles.footerLoader} size="small" color="#ff0050" /> : null
    ), [loading]);

    return (
        <View style={styles.container}>
            <FlashList
                ref={listRef}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                data={photos}
                numColumns={COLUMN_COUNT}
                estimatedItemSize={IMAGE_HEIGHT}
                extraData={selectedPhotos}
                overScrollMode="never"
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={renderFooter}
                removeClippedSubviews={true}
            />

            {selectedPhotos.length > 0 && (
                <View style={styles.selectedPhotosContainer}>
                    <FlatList
                        data={selectedPhotos}
                        renderItem={renderSelectedPhoto}
                        keyExtractor={item => item.id}
                        horizontal
                        style={styles.selectedPhotosList}
                        contentContainerStyle={styles.selectedPhotosContent}
                        showsHorizontalScrollIndicator={false}
                        overScrollMode="never"
                        removeClippedSubviews={true}
                    />
                </View>
            )}

            <Pressable style={styles.scrollTopButton} onPress={scrollToTop}>
                <Ionicons name='caret-up' size={30} color="white" />
            </Pressable>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    image: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        margin: 0.5,
        borderRadius: 8,
    },
    imageContent: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
        backgroundColor: '#1a1a1a',
    },
    selectedImage: {
        borderWidth: 1,
        borderColor: "#ff0050"
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    selectedIndexContainer: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff0050',
    },
    selectedIndexText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
    unselectedCountContainerStyle: {
        zIndex: 999,
        position: "absolute",
        right: 5,
        top: 5,
        width: 23,
        height: 23,
        borderRadius: 23,
        backgroundColor: "rgba(255,255,255, 0.4)",
        borderWidth: 1,
        borderColor: "white"
    },
    durationContainer: {
        position: 'absolute',
        right: 3,
        bottom: 1
    },
    durationText: {
        fontSize: 12,
        color: "white",
        fontFamily: 'SukhumvitSet_Bd'
    },
    selectedPhotoContainer: {
        position: 'relative',
        width: '100%',
        flex: 1,
        justifyContent: 'flex-start',
        height: 100,
        marginHorizontal: 5
    },
    selectedPhotoImage: {
        width: 65,
        height: 65,
        borderRadius: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ff0050',
        borderRadius: 50,
        padding: 2,
    },
    selectedPhotosContainer: {
        width: '80%',
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        bottom: "3%",
        left: 0,
        borderRadius: 20,
        marginLeft: 10
    },
    selectedPhotosList: {
        paddingVertical: 6,
    },
    selectedPhotosContent: {
        paddingHorizontal: 5
    },
    scrollTopButton: {
        position: 'absolute',
        right: "5%",
        bottom: "3%",
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 100,
        elevation: 10
    },
    footerLoader: {
        paddingVertical: 20,
    }
});

export default TabScreen;