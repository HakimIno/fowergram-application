import { MMKV } from 'react-native-mmkv';
import { FeedItem } from 'src/data/mockFeedData';
import { StoryItem } from 'src/screens/TabsBottomScreen/HomeScreen/components/Story';
import { FeedInfo } from 'src/screens/TabsBottomScreen/HomeScreen/types';

// Create MMKV storage instance
const feedStorage = new MMKV({
  id: 'feed-storage',
  encryptionKey: 'feed-storage-key',
});

// Keys
const FEED_DATA_KEY = 'feed-data';
const STORIES_DATA_KEY = 'stories-data';
const FEED_LAST_UPDATED_KEY = 'feed-last-updated';
const FEED_PAGE_KEY = 'feed-current-page';
const FEED_VISIBLE_ITEMS_KEY = 'feed-visible-items';
const DATA_VERSION_KEY = 'feed-data-version';

// Current data version - เพิ่มเวอร์ชันเมื่อต้องการบังคับให้แคชถูกล้าง (เช่น เมื่อรูปแบบข้อมูลเปลี่ยน)
const CURRENT_DATA_VERSION = '1.0.0';

// In-memory cache for ultra-fast access
// This prevents redundant JSON parsing operations
const memoryCache = {
  feedData: null as FeedInfo[] | null,
  storiesData: null as StoryItem[] | null,
  visibleItems: null as FeedInfo[] | null,
  currentPage: 1,
  lastUpdated: 0,
};

// Add new constants for content grid storage
const contentStorage = new MMKV({
  id: 'content-grid-storage',
  encryptionKey: 'content-grid-storage-key',
});

// Keys for content storage
const CONTENT_GRID_DATA_KEY = 'content-grid-data';
const CONTENT_GRID_VERSION_KEY = 'content-grid-version';
const CURRENT_CONTENT_VERSION = '1.0.0';

// Memory cache for content grid
const contentMemoryCache = {
  gridData: null as any[] | null,
};

/**
 * Convert FeedItem to FeedInfo type for compatibility
 */
export const convertFeedItemToFeedInfo = (item: FeedItem): FeedInfo => {
  return {
    id: item.id,
    images: item.images,
    title: item.title,
    likes: item.likes.toString(), // Convert number to string
    comments: item.comments,
    description: item.description,
    isVideo: item.isVideo,
    video: item.video,
  };
};

/**
 * Feed storage service for caching feed data using MMKV
 */
export const FeedStorageService = {
  /**
   * Initialize storage and check version
   */
  initialize: (): void => {
    try {
      const storedVersion = feedStorage.getString(DATA_VERSION_KEY);

      // ถ้าไม่มีเวอร์ชัน หรือเวอร์ชันไม่ตรงกับปัจจุบัน ให้ล้างแคชทั้งหมด
      if (!storedVersion || storedVersion !== CURRENT_DATA_VERSION) {
        console.log('Feed data version changed, clearing cache');
        FeedStorageService.clearAll();
        feedStorage.set(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      }
    } catch (error) {
      console.error('Error initializing feed storage:', error);
      // Try to recover by clearing cache
      try {
        FeedStorageService.clearAll();
      } catch (clearError) {
        console.error('Failed to clear cache after initialization error:', clearError);
      }
    }
  },

  /**
   * Save feed data to MMKV storage
   * @param data Feed data to save
   */
  saveFeedData: (data: FeedInfo[]): void => {
    try {
      // Update memory cache first (faster access)
      memoryCache.feedData = data;
      memoryCache.lastUpdated = Date.now();

      // Then persist to MMKV
      feedStorage.set(FEED_DATA_KEY, JSON.stringify(data));
      feedStorage.set(FEED_LAST_UPDATED_KEY, memoryCache.lastUpdated.toString());
    } catch (error) {
      console.error('Error saving feed data to MMKV:', error);
    }
  },

  /**
   * Save stories data to MMKV storage
   * @param data Stories data to save
   */
  saveStoriesData: (data: StoryItem[]): void => {
    try {
      // Update memory cache
      memoryCache.storiesData = data;

      // Persist to MMKV
      feedStorage.set(STORIES_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving stories data to MMKV:', error);
    }
  },

  /**
   * Save visible items for faster initial render
   * @param items Currently visible feed items
   */
  saveVisibleItems: (items: FeedInfo[]): void => {
    try {
      if (!items || items.length === 0) return;

      // Only store the first 5-6 visible items for quick access
      const visibleItems = items.slice(0, 6);
      memoryCache.visibleItems = visibleItems;

      // Save to MMKV for persistence
      feedStorage.set(FEED_VISIBLE_ITEMS_KEY, JSON.stringify(visibleItems));
    } catch (error) {
      console.error('Error saving visible items to MMKV:', error);
    }
  },

  /**
   * Get visible items for faster initial render
   * @returns Most recently visible feed items
   */
  getVisibleItems: (): FeedInfo[] | null => {
    try {
      // Try memory cache first
      if (memoryCache.visibleItems) {
        return memoryCache.visibleItems;
      }

      // Fall back to MMKV
      const data = feedStorage.getString(FEED_VISIBLE_ITEMS_KEY);
      const items = data ? JSON.parse(data) : null;

      // Update memory cache
      if (items) {
        memoryCache.visibleItems = items;
      }

      return items;
    } catch (error) {
      console.error('Error getting visible items from MMKV:', error);
      return null;
    }
  },

  /**
   * Get feed data from MMKV storage
   * @returns Cached feed data or null if not found
   */
  getFeedData: (): FeedInfo[] | null => {
    try {
      // Check memory cache first for ultra-fast access
      if (memoryCache.feedData) {
        return memoryCache.feedData;
      }

      // Fall back to MMKV if not in memory
      const data = feedStorage.getString(FEED_DATA_KEY);
      const parsedData = data ? JSON.parse(data) : null;

      // Update memory cache for next access
      if (parsedData) {
        memoryCache.feedData = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error('Error getting feed data from MMKV:', error);
      return null;
    }
  },

  /**
   * Get stories data from MMKV storage
   * @returns Cached stories data or null if not found
   */
  getStoriesData: (): StoryItem[] | null => {
    try {
      // Check memory cache first
      if (memoryCache.storiesData) {
        return memoryCache.storiesData;
      }

      // Fall back to MMKV
      const data = feedStorage.getString(STORIES_DATA_KEY);
      const parsedData = data ? JSON.parse(data) : null;

      // Update memory cache
      if (parsedData) {
        memoryCache.storiesData = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error('Error getting stories data from MMKV:', error);
      return null;
    }
  },

  /**
   * Check if cached feed data is expired
   * @param maxAgeMs Maximum age in milliseconds
   * @returns True if data is expired or not found
   */
  isFeedDataExpired: (maxAgeMs: number = 5 * 60 * 1000): boolean => {
    try {
      // Check memory cache first (fastest)
      if (memoryCache.lastUpdated > 0) {
        return Date.now() - memoryCache.lastUpdated > maxAgeMs;
      }

      // Fall back to MMKV
      const lastUpdated = feedStorage.getString(FEED_LAST_UPDATED_KEY);

      if (!lastUpdated) return true;

      const lastUpdatedTime = parseInt(lastUpdated, 10);
      const now = Date.now();

      // Update memory cache
      memoryCache.lastUpdated = lastUpdatedTime;

      return now - lastUpdatedTime > maxAgeMs;
    } catch (error) {
      console.error('Error checking feed data expiration:', error);
      return true;
    }
  },

  /**
   * Force data refresh by marking as expired
   */
  markDataAsExpired: (): void => {
    try {
      memoryCache.lastUpdated = 0;
      feedStorage.delete(FEED_LAST_UPDATED_KEY);
    } catch (error) {
      console.error('Error marking data as expired:', error);
    }
  },

  /**
   * Save current feed page
   * @param page Current page number
   */
  saveCurrentPage: (page: number): void => {
    try {
      // Update memory cache
      memoryCache.currentPage = page;

      // Persist to MMKV
      feedStorage.set(FEED_PAGE_KEY, page.toString());
    } catch (error) {
      console.error('Error saving current page to MMKV:', error);
    }
  },

  /**
   * Get current feed page
   * @returns Current page number or 1 if not found
   */
  getCurrentPage: (): number => {
    try {
      // Check memory cache first
      if (memoryCache.currentPage > 1) {
        return memoryCache.currentPage;
      }

      // Fall back to MMKV
      const page = feedStorage.getString(FEED_PAGE_KEY);
      const parsedPage = page ? parseInt(page, 10) : 1;

      // Update memory cache
      memoryCache.currentPage = parsedPage;

      return parsedPage;
    } catch (error) {
      console.error('Error getting current page from MMKV:', error);
      return 1;
    }
  },

  /**
   * Clear all feed storage data
   */
  clearAll: (): void => {
    try {
      // Clear memory cache
      memoryCache.feedData = null;
      memoryCache.storiesData = null;
      memoryCache.visibleItems = null;
      memoryCache.currentPage = 1;
      memoryCache.lastUpdated = 0;

      // Clear MMKV storage for feed data
      feedStorage.delete(FEED_DATA_KEY);
      feedStorage.delete(STORIES_DATA_KEY);
      feedStorage.delete(FEED_LAST_UPDATED_KEY);
      feedStorage.delete(FEED_PAGE_KEY);
      feedStorage.delete(FEED_VISIBLE_ITEMS_KEY);

      // Don't delete the version key
      feedStorage.set(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    } catch (error) {
      console.error('Error clearing feed storage:', error);
      // If clearAll fails, try resetting the MMKV instance as last resort
      try {
        feedStorage.clearAll();
      } catch (clearError) {
        console.error('Failed to reset MMKV storage:', clearError);
      }
    }
  }
};

/**
 * Content Grid storage service for caching explore grid data
 */
export const ContentStorageService = {
  /**
   * Initialize storage and check version
   */
  initialize: (): void => {
    try {
      const storedVersion = contentStorage.getString(CONTENT_GRID_VERSION_KEY);

      // Clear cache if version mismatch
      if (!storedVersion || storedVersion !== CURRENT_CONTENT_VERSION) {
        console.log('Content grid data version changed, clearing cache');
        ContentStorageService.clearData();
        contentStorage.set(CONTENT_GRID_VERSION_KEY, CURRENT_CONTENT_VERSION);
      }
    } catch (error) {
      console.error('Error initializing content grid storage:', error);
      // Try to recover by clearing cache
      try {
        ContentStorageService.clearData();
      } catch (clearError) {
        console.error('Failed to clear cache after initialization error:', clearError);
      }
    }
  },

  /**
   * Save grid data to MMKV storage
   * @param data Grid data to save
   */
  saveGridData: (data: any[]): void => {
    try {
      // Update memory cache first (faster access)
      contentMemoryCache.gridData = data;

      // Then persist to MMKV
      contentStorage.set(CONTENT_GRID_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving grid data to MMKV:', error);
    }
  },

  /**
   * Get grid data from MMKV storage
   * @returns Cached grid data or null if not found
   */
  getGridData: (): any[] | null => {
    try {
      // Check memory cache first for ultra-fast access
      if (contentMemoryCache.gridData) {
        return contentMemoryCache.gridData;
      }

      // Fall back to MMKV if not in memory
      const data = contentStorage.getString(CONTENT_GRID_DATA_KEY);
      const parsedData = data ? JSON.parse(data) : null;

      // Update memory cache for next access
      if (parsedData) {
        contentMemoryCache.gridData = parsedData;
      }

      return parsedData;
    } catch (error) {
      console.error('Error getting grid data from MMKV:', error);
      return null;
    }
  },

  /**
   * Clear all grid data
   */
  clearData: (): void => {
    try {
      contentMemoryCache.gridData = null;
      contentStorage.delete(CONTENT_GRID_DATA_KEY);
    } catch (error) {
      console.error('Error clearing content grid data:', error);
    }
  }
};

const appStorage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'app-storage-key',
});

export const MMKVStorage = {
  getItem: (key: string): string | null => {
    return appStorage.getString(key) || null;
  },

  setItem: (key: string, value: string): void => {
    appStorage.set(key, value);
  },

  removeItem: (key: string): void => {
    appStorage.delete(key);
  },

  clear: (): void => {
    appStorage.clearAll();
  },

  // For objects
  getObject: <T>(key: string): T | null => {
    const value = appStorage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return null;
    }
  },

  setObject: <T>(key: string, value: T): void => {
    appStorage.set(key, JSON.stringify(value));
  },
}; 