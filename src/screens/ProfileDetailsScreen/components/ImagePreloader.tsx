import { InteractionManager, Platform } from 'react-native';
import React, { memo, useEffect } from 'react';
import { Image as ExpoImage } from 'expo-image';

interface ImagePreloaderProps {
    imageUrls: string[];
}

// Optimize the preloading strategy based on the platform and device capabilities
const ImagePreloader = memo(({ imageUrls }: ImagePreloaderProps) => {
    useEffect(() => {
        if (!imageUrls || imageUrls.length === 0) return;
        
        let isMounted = true;
        let timer: NodeJS.Timeout;

        const preloadImages = async () => {
            // Smaller chunk size and more delay on lower-end devices
            const CHUNK_SIZE = Platform.OS === 'ios' ? 3 : 2;
            const DELAY_BETWEEN_CHUNKS = Platform.OS === 'ios' ? 150 : 200;

            try {
                for (let i = 0; i < imageUrls.length && isMounted; i += CHUNK_SIZE) {
                    // Only process a small chunk at a time
                    const chunk = imageUrls.slice(i, i + CHUNK_SIZE);
                    
                    // Prefetch in parallel within the chunk
                    await Promise.all(
                        chunk.map(url => ExpoImage.prefetch(url))
                    );
                    
                    // Delay between chunks to avoid blocking the main thread
                    await new Promise(resolve => {
                        timer = setTimeout(resolve, DELAY_BETWEEN_CHUNKS);
                    });
                }
            } catch (error) {
                console.warn("Image prefetching error:", error);
            }
        };

        // Run after all interactions and animations are complete
        InteractionManager.runAfterInteractions(() => {
            // Priority: first load only the first few images immediately
            const immediateLoad = imageUrls.slice(0, 3);
            Promise.all(immediateLoad.map(url => ExpoImage.prefetch(url)))
                .then(() => {
                    // Then load the rest with the chunking strategy
                    if (isMounted) {
                        preloadImages();
                    }
                });
        });

        return () => {
            isMounted = false;
            if (timer) clearTimeout(timer);
        };
    }, [imageUrls]);

    return null;
});

export default ImagePreloader; 