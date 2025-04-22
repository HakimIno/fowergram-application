import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomBarParamList } from 'src/navigation/types';

export interface FeedInfo {
  id: string;
  images: string[];
  title: string;
  likes: string;
  comments: number;
  description: string;
  isVideo: boolean;
  video?: string;
}

export type HomeNavigationProp = StackNavigationProp<BottomBarParamList, "bottom_bar_home">; 