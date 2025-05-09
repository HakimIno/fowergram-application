import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import * as MediaLibrary from 'expo-media-library';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV storage
const storage = new MMKV({
    id: 'media-storage',
    encryptionKey: 'your-encryption-key'
});

// MMKV storage for Zustand persist middleware
const mmkvStorage = {
    getItem: (name: string) => {
        const value = storage.getString(name);
        return value ? JSON.parse(value) : null;
    },
    setItem: (name: string, value: string) => {
        storage.set(name, value);
    },
    removeItem: (name: string) => {
        storage.delete(name);
    },
};

interface MediaState {
    loading: boolean;
    photos: MediaLibrary.Asset[];
    videos: MediaLibrary.Asset[];
    allFiles: MediaLibrary.Asset[];
    albumsInfo: { title: string; url: string; assetCount: number }[];
    selectAlbums: { title: string; indx: number };
    selectedPhotos: MediaLibrary.Asset[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor: string | undefined;
    };
    pageSize: number;
    
    // Actions
    setLoading: (loading: boolean) => void;
    setPhotos: (photos: MediaLibrary.Asset[]) => void;
    appendPhotos: (photos: MediaLibrary.Asset[]) => void;
    setVideos: (videos: MediaLibrary.Asset[]) => void;
    appendVideos: (videos: MediaLibrary.Asset[]) => void;
    setAllFiles: (files: MediaLibrary.Asset[]) => void;
    appendAllFiles: (files: MediaLibrary.Asset[]) => void;
    setAlbumsInfo: (albums: { title: string; url: string; assetCount: number }[]) => void;
    setSelectAlbums: (album: { title: string; indx: number }) => void;
    setSelectPhotos: (photos: MediaLibrary.Asset[]) => void;
    setPageInfo: (info: { hasNextPage: boolean; endCursor: string | undefined }) => void;
    
    // Batch updates
    batchActions: (fn: (state: MediaState) => void) => void;
}

// Define initial state
const initialState = {
    loading: false,
    photos: [],
    videos: [],
    allFiles: [],
    albumsInfo: [],
    selectAlbums: {
        title: 'Photos',
        indx: 0
    },
    selectedPhotos: [],
    pageInfo: {
        hasNextPage: true,
        endCursor: undefined
    },
    pageSize: 15,
};

// Create the store with middleware for performance
export const useMediaStore = create<MediaState>()(
    subscribeWithSelector(
        devtools(
            persist(
                immer(
                    (set, get) => ({
                        ...initialState,
                        
                        // Actions
                        setLoading: (loading) => set((state) => {
                            state.loading = loading;
                        }, false, "setLoading"),
                        
                        setPhotos: (photos) => set((state) => {
                            state.photos = photos;
                        }, false, "setPhotos"),
                        
                        appendPhotos: (photos) => set((state) => {
                            state.photos.push(...photos);
                        }, false, "appendPhotos"),
                        
                        setVideos: (videos) => set((state) => {
                            state.videos = videos;
                        }, false, "setVideos"),
                        
                        appendVideos: (videos) => set((state) => {
                            state.videos.push(...videos);
                        }, false, "appendVideos"),
                        
                        setAllFiles: (files) => set((state) => {
                            state.allFiles = files;
                        }, false, "setAllFiles"),
                        
                        appendAllFiles: (files) => set((state) => {
                            state.allFiles.push(...files);
                        }, false, "appendAllFiles"),
                        
                        setAlbumsInfo: (albums) => set((state) => {
                            state.albumsInfo = albums;
                        }, false, "setAlbumsInfo"),
                        
                        setSelectAlbums: (album) => set((state) => {
                            state.selectAlbums = album;
                            // Reset pagination and content when changing albums
                            state.pageInfo = {
                                hasNextPage: true,
                                endCursor: undefined
                            };
                            state.photos = [];
                            state.videos = [];
                            state.allFiles = [];
                        }, false, "setSelectAlbums"),
                        
                        setSelectPhotos: (photos) => set((state) => {
                            state.selectedPhotos = photos;
                        }, false, "setSelectPhotos"),
                        
                        setPageInfo: (info) => set((state) => {
                            state.pageInfo = info;
                        }, false, "setPageInfo"),
                        
                        // Batch multiple actions together for better performance
                        batchActions: (fn) => {
                            set((state) => {
                                fn(state);
                                return state;
                            }, false, "batchActions");
                        }
                    })
                ),
                {
                    name: 'media-storage',
                    storage: createJSONStorage(() => mmkvStorage),
                    // Only persist these keys to storage
                    partialize: (state) => ({
                        selectAlbums: state.selectAlbums,
                        selectedPhotos: state.selectedPhotos
                    }),
                }
            )
        )
    )
);

// Helper selectors to optimize re-renders
export const useSelectedPhotos = () => useMediaStore((state) => state.selectedPhotos);
export const useAlbumsInfo = () => useMediaStore((state) => state.albumsInfo);
export const useSelectAlbums = () => useMediaStore((state) => state.selectAlbums);
export const useLoading = () => useMediaStore((state) => state.loading); 