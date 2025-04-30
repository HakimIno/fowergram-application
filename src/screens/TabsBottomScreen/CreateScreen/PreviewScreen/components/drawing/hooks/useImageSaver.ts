import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export const useImageSaver = (canvasRef: any) => {
    const saveImage = useCallback(async (onSave?: (uri: string) => void) => {
        try {
            if (!canvasRef.current) {
                Alert.alert('Error', 'Cannot save image. Canvas reference is not available.');
                return;
            }

            // Create a snapshot of the canvas
            const snapshot = canvasRef.current.makeImageSnapshot();
            if (!snapshot) {
                Alert.alert('Error', 'Failed to create image snapshot.');
                return;
            }

            // Convert snapshot to base64
            const base64 = snapshot.encodeToBase64();
            if (!base64) {
                Alert.alert('Error', 'Failed to encode image.');
                return;
            }

            // Create a temporary file
            const tempFilePath = `${FileSystem.cacheDirectory}temp_image_${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(tempFilePath, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Save to media library
            const asset = await MediaLibrary.createAssetAsync(tempFilePath);

            // Notify user
            Alert.alert('Success', 'Image saved to gallery successfully!');

            // Call onSave callback if provided
            if (onSave) {
                onSave(asset.uri);
            }

            // Delete temp file
            await FileSystem.deleteAsync(tempFilePath);

            return asset.uri;
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image: ' + (error instanceof Error ? error.message : String(error)));
            return null;
        }
    }, [canvasRef]);

    // Initialize permission request
    const requestMediaLibraryPermission = useCallback(async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        return status === 'granted';
    }, []);

    return {
        saveImage,
        requestMediaLibraryPermission,
    };
}; 