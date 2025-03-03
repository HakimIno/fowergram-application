import { ViewStyle, StyleProp } from 'react-native';

export interface PullToRefreshProps {
  /**
   * Function to be called when refresh is triggered
   */
  onRefresh: () => Promise<void>;
  
  /**
   * Whether the refresh is currently in progress
   */
  refreshing: boolean;
  
  /**
   * Custom styles for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom styles for the refresh indicator container
   */
  indicatorContainerStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom component to be rendered as the refresh indicator
   */
  customIndicator?: React.ReactNode;
  
  /**
   * Color of the default refresh indicator
   */
  indicatorColor?: string;
  
  /**
   * Size of the default refresh indicator
   */
  indicatorSize?: number;
  
  /**
   * Pull distance threshold to trigger refresh
   */
  pullThreshold?: number;
  
  /**
   * Maximum pull distance
   */
  maxPullDistance?: number;
  
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
  
  /**
   * Children components
   */
  children: React.ReactNode;
  
  /**
   * Whether to enable the pull to refresh functionality
   */
  enabled?: boolean;
  
  /**
   * Callback when pull progress changes (0 to 1)
   */
  onPullProgress?: (progress: number) => void;
}

export interface PullToRefreshState {
  refreshing: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  isPulling: boolean;
} 