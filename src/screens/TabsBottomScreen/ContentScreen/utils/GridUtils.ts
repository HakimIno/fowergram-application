import { Dimensions, PixelRatio } from 'react-native';
import { GridItem } from '../components/GridItem';

// Get screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate pixel ratio for optimal image loading
const PIXEL_RATIO = PixelRatio.get();

// Grid configuration
export const VIEWPORT_MULTIPLIER = 2.5; // How many screen sizes to fill in each direction
export const GRID_GAP = 2; // Space between cells

// Base cell size for 1.5x2.5 cells
export const CELL_WIDTH_NORMAL = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / 3; // Standard width
export const CELL_HEIGHT_NORMAL = CELL_WIDTH_NORMAL * 1.67 + GRID_GAP; // 1.5x2.5 ratio

// Larger cell size for 2x2.5 cells (first and last in row)
export const CELL_WIDTH_LARGE = CELL_WIDTH_NORMAL * 1.33; // 2x width
export const CELL_HEIGHT_LARGE = CELL_HEIGHT_NORMAL; // Same height as normal cells

// Extra large cell size for last cell in even rows (2.5x2.5)
export const CELL_WIDTH_XLARGE = CELL_WIDTH_NORMAL * 1.67; // 2.5x width
export const CELL_HEIGHT_XLARGE = CELL_HEIGHT_NORMAL; // Same height as normal cells

// Calculate grid size based on viewport
export const GRID_COLS = Math.ceil((SCREEN_WIDTH * VIEWPORT_MULTIPLIER) / CELL_WIDTH_NORMAL) + 1;
export const GRID_ROWS = Math.ceil((SCREEN_HEIGHT * VIEWPORT_MULTIPLIER) / CELL_HEIGHT_NORMAL) * 2 + 2;

// Total grid dimensions
export const GRID_WIDTH = CELL_WIDTH_NORMAL * GRID_COLS + (GRID_COLS - 1) * GRID_GAP + CELL_WIDTH_XLARGE;
export const GRID_HEIGHT = (CELL_HEIGHT_NORMAL + GRID_GAP) * (GRID_ROWS / 2) + CELL_HEIGHT_NORMAL;

// Optimized spring configuration for smoother animation
export const SPRING_CONFIG = {
    damping: 18,
    mass: 0.6,
    stiffness: 180,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

// Image categories for random loading
export const IMAGE_CATEGORIES = [
    'nature',
    'fashion',
    'technology',
    'abstract',
    'animals',
    'architecture',
    'food',
    'travel',
    'people',
    'business',
    'sports',
    'health',
    'arts',
    'interiors',
    'landscape',
    'portrait',
    'wallpaper',
    'textures',
    'minimal',
    'colorful'
];

// Tags for grid items
export const TAGS = [
    '2023 STYLE IS...',
    'IN THE DEPTHS OF THE OCEAN',
    'NATURAL WONDERS',
    'CITY LIFE',
    'THE FUTURE IS NOW',
    'HIDDEN TREASURES',
    'SUMMER VIBES',
    'WINTER WONDERS',
    'URBAN JUNGLE',
    'MINIMAL DESIGN'
];

// Cache for generated grid data to prevent regeneration
let cachedGridData: GridItem[] | null = null;

// Shuffle an array using Fisher-Yates algorithm
export const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Generate optimized image URL using picsum.photos with device pixel ratio consideration
export const getRandomImageUrl = (width = 800, height = 1200) => {
    // Scale dimensions based on pixel ratio for optimal display quality
    // Cap pixel ratio to 3 to avoid excessive download sizes
    const scaleFactor = Math.min(PIXEL_RATIO, 3);
    const scaledWidth = Math.round(width * scaleFactor);
    const scaledHeight = Math.round(height * scaleFactor);
    
    // Add random parameter to prevent caching
    const randomSeed = Math.floor(Math.random() * 1000);
    const seedParam = `?random=${randomSeed}`;

    // Use picsum.photos which is more reliable for placeholder images
    return `https://picsum.photos/${scaledWidth}/${scaledHeight}${seedParam}`;
};

// Generate grid data with optimization for performance
export const generateGridData = (): GridItem[] => {
    // Return cached data if available to prevent unnecessary recalculations
    if (cachedGridData && cachedGridData.length > 0) {
        return [...cachedGridData];
    }
    
    const data: GridItem[] = [];

    // Shuffle categories for more randomness
    const shuffledCategories = shuffleArray(IMAGE_CATEGORIES);
    const shuffledTags = shuffleArray(TAGS);

    // Create a grid with alternating row patterns but no offset
    let index = 0;
    
    // Use a more optimized loop structure
    const totalRows = GRID_ROWS;
    for (let row = 0; row < totalRows; row += 2) {
        const isOddRow = Math.floor(row / 2) % 2 !== 0; // Alternate between even and odd rows

        // No offset for any row
        const offsetX = 0;

        // Same number of columns for all rows
        const colsInThisRow = GRID_COLS;

        let rowLeft = offsetX;

        for (let col = 0; col < colsInThisRow; col++) {
            const tagIndex = index % shuffledTags.length;
            const categoryIndex = index % shuffledCategories.length;

            // Special size conditions:
            // - For odd rows: first and last cells are large (2 x 2.5)
            // - For even rows: last cell is extra large (2.5 x 2.5)
            const isLarge = isOddRow && (col === 0 || col === colsInThisRow - 1);
            const isXLarge = !isOddRow && col === colsInThisRow - 1;

            let cellWidth, cellHeight;

            if (isXLarge) {
                cellWidth = CELL_WIDTH_XLARGE;
                cellHeight = CELL_HEIGHT_XLARGE;
            } else if (isLarge) {
                cellWidth = CELL_WIDTH_LARGE;
                cellHeight = CELL_HEIGHT_LARGE;
            } else {
                cellWidth = CELL_WIDTH_NORMAL;
                cellHeight = CELL_HEIGHT_NORMAL;
            }

            // Calculate position 
            const left = rowLeft;
            const top = (row / 2) * (CELL_HEIGHT_NORMAL + GRID_GAP);

            // Calculate optimal image dimensions based on cell size and device
            // Use 400x600 for base dimensions to improve loading performance while maintaining quality
            const baseWidth = 400;
            const baseHeight = 600;
            
            // Generate random image for each cell with optimized dimensions
            const imageUrl = getRandomImageUrl(baseWidth, baseHeight);

            data.push({
                id: `item-${index}`,
                imageUrl,
                tag: shuffledTags[tagIndex],
                left,
                top,
                width: cellWidth,
                height: cellHeight,
                isLarge,
                isXLarge
            });

            // Update the next cell position
            rowLeft += cellWidth + GRID_GAP;
            index++;
        }
    }

    // Cache the generated data
    cachedGridData = [...data];
    
    return data;
};

// Reset cached grid data
export const resetGridDataCache = () => {
    cachedGridData = null;
};

// Calculate grid dimensions based on grid data with optimized calculations
export const calculateGridDimensions = (gridData: GridItem[]) => {
    if (gridData.length === 0) return { width: GRID_WIDTH, height: GRID_HEIGHT };

    let maxRight = 0;
    let maxBottom = 0;

    // Optimize loop with direct array indexing instead of forEach
    const length = gridData.length;
    for (let i = 0; i < length; i++) {
        const item = gridData[i];
        const right = item.left + item.width;
        const bottom = item.top + item.height;

        maxRight = Math.max(maxRight, right);
        maxBottom = Math.max(maxBottom, bottom);
    }

    // Add some padding to ensure we can scroll to the edges
    return {
        width: maxRight + GRID_GAP * 2,
        height: maxBottom + GRID_GAP * 2
    };
}; 