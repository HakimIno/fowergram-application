import { useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { useMediaStore, useAlbumsInfo, useLoading, useSelectAlbums } from '../../../../store/mediaStore';

export const useCreateScreen = () => {
    const {
        photos,
        videos,
        allFiles,
        pageInfo,
        pageSize,
        setLoading,
        setPhotos,
        appendPhotos,
        setVideos,
        appendVideos,
        setAllFiles,
        appendAllFiles,
        setAlbumsInfo,
        setSelectAlbums,
        setPageInfo,
        batchActions
    } = useMediaStore();
    
    // Use optimized selectors
    const loading = useLoading();
    const albumsInfo = useAlbumsInfo();
    const selectAlbums = useSelectAlbums();

    const loadPhotos = async (isInitial = true) => {
        try {
            setLoading(true);

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access media library denied');
                return;
            }

            const options = {
                first: pageSize,
                after: isInitial ? undefined : pageInfo.endCursor,
                sortBy: [MediaLibrary.SortBy.creationTime],
                sortOrder: 'desc'
            };

            const getAlbum = await MediaLibrary.getAlbumAsync(selectAlbums.title);

            // Load photos and videos concurrently
            const [photosResponse, videosResponse] = await Promise.all([
                MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.photo,
                    album: getAlbum,
                    ...options,
                }),
                MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.video,
                    album: getAlbum,
                    ...options,
                })
            ]);

            // Combine and sort assets
            const newAssets = [...photosResponse.assets, ...videosResponse.assets]
                .sort((a, b) => b.creationTime - a.creationTime);

            // Filter media arrays
            const newPhotos = newAssets.filter(asset => asset.mediaType === MediaLibrary.MediaType.photo);
            const newVideos = newAssets.filter(asset => asset.mediaType === MediaLibrary.MediaType.video);
            
            // Batch state updates for better performance
            batchActions((state) => {
                // Update pagination info
                state.pageInfo = {
                    hasNextPage: photosResponse.hasNextPage || videosResponse.hasNextPage,
                    endCursor: photosResponse.endCursor || videosResponse.endCursor
                };
                
                if (isInitial) {
                    state.photos = newPhotos;
                    state.videos = newVideos;
                    state.allFiles = newAssets;
                } else {
                    state.photos.push(...newPhotos);
                    state.videos.push(...newVideos);
                    state.allFiles.push(...newAssets);
                }
            });

            // Load albums info only on initial load
            if (isInitial) {
                const albumsResponse = await MediaLibrary.getAlbumsAsync();
                const albumsInfoArray = await Promise.all(
                    albumsResponse
                        .filter(album => album.assetCount > 0)
                        .map(async album => {
                            const albumOptions = {
                                first: 1,
                                album: album.id,
                                mediaType: MediaLibrary.MediaType.photo,
                                sortBy: [MediaLibrary.SortBy.creationTime],
                                sortOrder: "desc",
                            };

                            const { assets } = await MediaLibrary.getAssetsAsync(albumOptions);
                            const firstAsset = assets.find(item => item.albumId === album.id);

                            return firstAsset ? {
                                title: album.title,
                                url: firstAsset.uri,
                                assetCount: album.assetCount,
                            } : null;
                        })
                );

                const validAlbumsInfoArray = albumsInfoArray.filter((album): album is { title: string; url: string; assetCount: number } => album !== null);
                setAlbumsInfo(validAlbumsInfoArray.sort((a, b) => b.assetCount - a.assetCount));
            }

        } catch (error) {
            console.error('Error loading photos:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (pageInfo.hasNextPage && !loading) {
            await loadPhotos(false);
        }
    };

    const handelSelectAlbums = (title: string, indx: number) => {
        setSelectAlbums({ title, indx });
    };

    useEffect(() => {
        if (selectAlbums.title) {
            loadPhotos(true);
        }
    }, [selectAlbums]);

    return {
        loading,
        photos,
        videos,
        albumsInfo,
        allFiles,
        loadPhotos,
        loadMore,
        selectAlbums,
        handelSelectAlbums
    };
};