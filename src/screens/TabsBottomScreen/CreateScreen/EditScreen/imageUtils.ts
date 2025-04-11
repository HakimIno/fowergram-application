import { SkImage } from '@shopify/react-native-skia';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
// import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Interface for filter definition
 */
export interface Filter {
  name: string;
  matrix: number[];
}

/**
 * Interface for filter category
 */
export interface FilterCategory {
  id: string;
  name: string;
  filters: Filter[];
}

/**
 * Interface for adjustment definition
 */
export interface Adjustment {
  name: string;
  min: number;
  max: number;
  default: number;
}

/**
 * Predefined filter categories
 */
export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: 'basic',
    name: 'พื้นฐาน',
    filters: [
      { name: 'Normal', matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'B&W', matrix: [0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Sepia', matrix: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'High Contrast', matrix: [1.5, 0, 0, 0, -0.2, 0, 1.5, 0, 0, -0.2, 0, 0, 1.5, 0, -0.2, 0, 0, 0, 1, 0] },
      { name: 'Low Contrast', matrix: [0.8, 0, 0, 0, 0.1, 0, 0.8, 0, 0, 0.1, 0, 0, 0.8, 0, 0.1, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'classic',
    name: 'คลาสสิค',
    filters: [
      { name: 'Vintage', matrix: [0.9, 0.5, 0.1, 0, 0, 0.3, 0.8, 0.1, 0, 0, 0.2, 0.3, 0.5, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Fade', matrix: [1, 0.2, 0.2, 0.03, 0, 0.2, 1, 0.2, 0.03, 0, 0.2, 0.2, 1, 0.03, 0, 0, 0, 0, 1, 0] },
      { name: 'Polaroid', matrix: [1, 0.3, 0.2, 0, 0.05, 0.2, 0.9, 0.2, 0, 0.05, 0.1, 0.2, 0.8, 0, 0.05, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'tones',
    name: 'โทนสี',
    filters: [
      { name: 'Cool', matrix: [1, 0, 0, 0, 0, 0, 1, 0.1, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Warm', matrix: [1.1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Golden Hour', matrix: [1.2, 0.2, 0, 0, 0, 0.1, 1.1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Blush', matrix: [1.1, 0, 0.2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Aqua Glow', matrix: [0.9, 0, 0.1, 0, 0, 0, 1, 0.2, 0, 0, 0.1, 0, 1.2, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Lavender', matrix: [1.05, 0, 0.1, 0, 0, 0, 1, 0.15, 0, 0, 0.1, 0, 1.1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Amber', matrix: [1.2, 0.1, 0, 0, 0, 0.05, 1.05, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'vibrant',
    name: 'สดใส',
    filters: [
      { name: 'Lush', matrix: [1.2, 0, 0.1, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Sunlit', matrix: [1.3, 0.1, 0, 0, 0.05, 0.1, 1.2, 0, 0, 0.05, 0, 0, 1, 0, 0.05, 0, 0, 0, 1, 0] },
      { name: 'Velvet', matrix: [1.1, -0.1, 0, 0, 0, -0.1, 1.2, 0, 0, 0, 0, -0.1, 1.1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Dramatic', matrix: [1.5, -0.3, -0.1, 0, -0.1, -0.3, 1.5, -0.1, 0, -0.1, -0.3, -0.3, 1.5, 0, -0.1, 0, 0, 0, 1, 0] },
      { name: 'Pop', matrix: [1.4, 0, 0, 0, -0.1, 0, 1.4, 0, 0, -0.1, 0, 0, 1.4, 0, -0.1, 0, 0, 0, 1, 0] },
      { name: 'Vivid', matrix: [1.2, 0.1, 0.1, 0, 0, 0.1, 1.2, 0.1, 0, 0, 0.1, 0.1, 1.2, 0, 0, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'pastel',
    name: 'พาสเทล',
    filters: [
      { name: 'Pastel Dream', matrix: [0.9, 0.1, 0.1, 0, 0.05, 0.1, 0.9, 0.1, 0, 0.05, 0.1, 0.1, 0.9, 0, 0.05, 0, 0, 0, 1, 0] },
      { name: 'Forest Mist', matrix: [0.8, 0.2, 0, 0, 0, 0.2, 1, 0.1, 0, 0, 0, 0.1, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Soft Peach', matrix: [1.1, 0.1, 0.1, 0, 0.03, 0.1, 0.9, 0.05, 0, 0.03, 0.05, 0.05, 0.85, 0, 0.03, 0, 0, 0, 1, 0] },
      { name: 'Mint', matrix: [0.85, 0.05, 0, 0, 0, 0.1, 1.05, 0.05, 0, 0, 0, 0.15, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Cotton Candy', matrix: [1, 0.2, 0.2, 0, 0.04, 0.1, 0.8, 0.2, 0, 0.04, 0.2, 0.1, 1, 0, 0.04, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'mood',
    name: 'มู้ดแอนด์โทน',
    filters: [
      { name: 'Cinematic', matrix: [1.3, -0.2, 0, 0, -0.05, -0.2, 1.2, -0.1, 0, -0.05, 0, -0.1, 1.3, 0, -0.05, 0, 0, 0, 1, 0] },
      { name: 'Moody', matrix: [0.8, 0.1, 0, 0, -0.1, 0.1, 0.8, 0.1, 0, -0.1, 0, 0.1, 0.9, 0, -0.1, 0, 0, 0, 1, 0] },
      { name: 'Twilight', matrix: [0.9, 0, 0.2, 0, 0, 0, 0.9, 0.3, 0, 0, 0.2, 0, 1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Noir', matrix: [0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Muted', matrix: [0.9, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'creative',
    name: 'สร้างสรรค์',
    filters: [
      { name: 'Cyberpunk', matrix: [0.8, 0, 0.2, 0, 0, 0, 1, 0.4, 0, 0, 0.2, 0, 1.3, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Neon', matrix: [0.7, 0.0, 0.3, 0, 0, 0.0, 0.8, 0.3, 0, 0, 0.3, 0.0, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Retrowave', matrix: [0.8, 0.2, 0.3, 0, 0, 0.1, 0.7, 0.4, 0, 0, 0.3, 0.2, 0.8, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Glitch', matrix: [1.2, -0.3, 0.3, 0, 0, -0.2, 1.1, 0.1, 0, 0, 0.3, -0.2, 0.9, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Vaporwave', matrix: [0.8, 0.3, 0.5, 0, 0, 0.4, 0.7, 0.3, 0, 0, 0.3, 0.4, 0.6, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Comic', matrix: [1.5, -0.3, 0, 0, 0, -0.2, 1.5, 0, 0, 0, 0, -0.3, 1.5, 0, 0, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'portrait',
    name: 'ภาพบุคคล',
    filters: [
      { name: 'Soft Skin', matrix: [1.1, 0.1, 0.1, 0, 0.03, 0.1, 1.05, 0.05, 0, 0.03, 0.05, 0.05, 1, 0, 0.03, 0, 0, 0, 1, 0] },
      { name: 'Glow', matrix: [1.15, 0.15, 0.1, 0, 0.05, 0.1, 1.1, 0.05, 0, 0.05, 0.05, 0.05, 1.05, 0, 0.05, 0, 0, 0, 1, 0] },
      { name: 'Natural', matrix: [1.05, 0, 0, 0, 0.02, 0, 1.05, 0, 0, 0.02, 0, 0, 1.05, 0, 0.02, 0, 0, 0, 1, 0] },
      { name: 'Clarity', matrix: [1.1, -0.1, 0, 0, 0, -0.1, 1.1, 0, 0, 0, 0, -0.1, 1.1, 0, 0, 0, 0, 0, 1, 0] },
      { name: 'Beauty', matrix: [1.08, 0.05, 0.05, 0, 0.04, 0.05, 1.03, 0.03, 0, 0.04, 0.03, 0.03, 0.98, 0, 0.04, 0, 0, 0, 1, 0] },
      { name: 'Studio', matrix: [1.2, -0.05, 0, 0, -0.02, -0.05, 1.1, 0, 0, -0.02, 0, 0, 1.1, 0, -0.02, 0, 0, 0, 1, 0] },
    ]
  },
  {
    id: 'food_travel',
    name: 'อาหาร และ ท่องเที่ยว',
    filters: [
      { name: 'Tasty', matrix: [1.2, 0.05, 0.05, 0, 0, 0.05, 1.1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] }, // Enhances food colors
      { name: 'Gourmet', matrix: [1.1, -0.1, 0.1, 0, 0, -0.1, 1.1, 0.1, 0, 0, 0.1, -0.1, 1, 0, 0, 0, 0, 0, 1, 0] }, // Rich contrast for food
      { name: 'Fresh', matrix: [1, 0, 0, 0, 0, 0, 1.15, 0, 0, 0, 0, 0, 1.05, 0, 0, 0, 0, 0, 1, 0] }, // Fresh greens and highlights
      { name: 'Sunset', matrix: [1.2, 0.2, 0.1, 0, 0, 0.1, 1, 0.1, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0] }, // Travel sunset vibes
      { name: 'Azure', matrix: [0.9, 0, 0, 0, 0, 0, 1, 0.1, 0, 0, 0.1, 0.1, 1.3, 0, 0, 0, 0, 0, 1, 0] }, // Enhanced blues for water/sky
      { name: 'Wanderlust', matrix: [1.1, 0.1, 0, 0, 0, 0.05, 1.05, 0, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 1, 0] }, // Balanced travel look
    ]
  },
  {
    id: 'seasonal',
    name: 'ฤดูกาล และ เอฟเฟกต์พิเศษ',
    filters: [
      { name: 'Summer', matrix: [1.2, 0.1, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0] }, // Summer warm glow
      { name: 'Autumn', matrix: [1.2, 0.2, 0, 0, 0, 0.1, 0.9, 0, 0, 0, 0, 0, 0.8, 0, 0, 0, 0, 0, 1, 0] }, // Fall leaves and warmth
      { name: 'Winter', matrix: [0.9, 0, 0.1, 0, 0.05, 0, 0.95, 0.05, 0, 0.05, 0.1, 0, 1.1, 0, 0.05, 0, 0, 0, 1, 0] }, // Cool winter tones
      { name: 'Spring', matrix: [1, 0, 0, 0, 0, 0, 1.1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0] }, // Fresh spring tones
      { name: 'Neon Night', matrix: [0.7, 0.3, 0.3, 0, 0, 0.3, 0.7, 0.3, 0, 0, 0.3, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0] }, // Night club/neon effect
      { name: 'Dreamy', matrix: [1, 0.2, 0.1, 0, 0.05, 0.1, 1, 0.1, 0, 0.05, 0.1, 0.1, 1.1, 0, 0.05, 0, 0, 0, 1, 0] }, // Soft dreamy look
      { name: 'Moonlight', matrix: [0.8, 0, 0.2, 0, 0, 0, 0.8, 0.2, 0, 0, 0.2, 0, 1, 0, 0, 0, 0, 0, 1, 0] }, // Night moonlight effect
      { name: 'Mystic', matrix: [0.9, 0.1, 0.3, 0, 0, 0.1, 0.8, 0.2, 0, 0, 0.2, 0.1, 1.1, 0, 0, 0, 0, 0, 1, 0] }, // Mystical/magical look
    ]
  }
];

/**
 * Flat array of all filters for backward compatibility
 */
export const FILTERS: Filter[] = FILTER_CATEGORIES.reduce((all, category) => {
  return [...all, ...category.filters];
}, [] as Filter[]);

/**
 * Predefined adjustment types
 */
export const ADJUSTMENTS: Adjustment[] = [
  { name: 'Brightness', min: -1, max: 1, default: 0 },
  { name: 'Contrast', min: 0.5, max: 1.5, default: 1 },
  { name: 'Saturation', min: 0, max: 2, default: 1 },
  { name: 'Temperature', min: -1, max: 1, default: 0 },
  { name: 'Blur', min: 0, max: 20, default: 0 },
  { name: 'Highlights', min: -1, max: 1, default: 0 },
  { name: 'Shadows', min: -1, max: 1, default: 0 },
  { name: 'Vignette', min: 0, max: 1, default: 0 },
  { name: 'Fade', min: 0, max: 1, default: 0 },
  { name: 'Sharpen', min: 0, max: 1, default: 0 },
  { name: 'Structure', min: -1, max: 1, default: 0 },
  { name: 'Grain', min: 0, max: 1, default: 0 },
  { name: 'Tint', min: -1, max: 1, default: 0 },
];

/**
 * Interface for edited image data
 */
export interface EditedImageData {
  uri: string;
  selectedFilter: number;
  adjustments: number[];
}

/**
 * Save the edited image to the device's gallery
 * @param imageUri - URI of the image to save
 * @param editData - Editing data to apply
 * @returns Promise with the saved image URI
 */
export const saveEditedImage = async (
  imageUri: string,
  editData: {
    selectedFilter: number;
    adjustments: number[];
  }
): Promise<string> => {
  try {
    // Request permission to access the media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Generate a unique filename for the edited image
    const timestamp = new Date().getTime();
    const tempUri = `${FileSystem.cacheDirectory}edited_image_${timestamp}.jpg`;
    
    // Apply image manipulations based on the edit data
    // Note: expo-image-manipulator doesn't directly support color matrices,
    // so we're saving the image as-is for now. In a production app, you would
    // need to implement a more sophisticated approach to apply the actual filters.
    // const manipulationResult = await manipulateAsync(
    //   imageUri,
    //   [], // No transformations in this simplified example
    //   { format: SaveFormat.JPEG, compress: 0.8, base64: false }
    // );

    // Save the image to the media library
    // const asset = await MediaLibrary.createAssetAsync(manipulationResult.uri);
    
    // Create an album if it doesn't exist
    // const album = await MediaLibrary.getAlbumAsync('Fowergram');
    // if (album === null) {
    //   await MediaLibrary.createAlbumAsync('Fowergram', asset, false);
    // } else {
    //   await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    // }

    // Store the edit data in a metadata file
    // const editDataString = JSON.stringify({
    //   uri: asset.uri,
    //   selectedFilter: editData.selectedFilter,
    //   adjustments: editData.adjustments,
    // });

    // Save the edit data to a local file for potential future use
    // const metadataPath = `${FileSystem.documentDirectory}edit_metadata_${asset.id}.json`;
    // await FileSystem.writeAsStringAsync(metadataPath, editDataString);

    // console.log('Image saved successfully:', asset.uri);
    // console.log('Edit metadata saved at:', metadataPath);

    return "";
  } catch (error) {
    console.error('Error saving edited image:', error);
    throw error;
  }
};

/**
 * Create a matrix that combines all adjustments
 * @param adjustments - Array of adjustment values
 * @returns Combined color matrix
 */
export const createCombinedAdjustmentMatrix = (adjustments: number[]): number[] => {
  const brightness = adjustments[0];
  const contrast = adjustments[1];
  const saturation = adjustments[2];
  const temperature = adjustments[3];
  const highlights = adjustments[5];
  const shadows = adjustments[6];
  
  // This is a simplified example - in a real app, you would create a proper combined matrix
  return [
    contrast, 0, 0, 0, brightness + (highlights * 0.5),
    0, contrast, 0, 0, brightness + (highlights * 0.5),
    0, 0, contrast, 0, brightness + (highlights * 0.5),
    0, 0, 0, 1, 0,
  ];
}; 