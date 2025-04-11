import React from 'react';
import Card from '../Card/Card';
import { HomeNavigationProp } from '../../../HomeScreen';

interface FeedInfo {
  id: string;
  images: string[];
  title: string;
  likes: string;
  comments: number;
  description: string;
  isVideo: boolean;
  video?: string;
}

interface FeedItemProps {
  item: FeedInfo;
  index: number;
  navigation: HomeNavigationProp;
}

const FeedItem = React.memo(({ 
  item, 
  index, 
  navigation 
}: FeedItemProps) => {
  return (
    <Card
      navigation={navigation}
      images={item.images}
      title={item.title}
      likes={item.likes}
      caption={""}
      onZoomStateChange={() => { }}
      cardIndex={index}
    />
  );
});

export default FeedItem;
export type { FeedInfo }; 