import { Post } from './types';

/**
 * Generates mock post data for testing
 */
export const generatePosts = (
    routes: Array<{ key: string; title: string }>, 
    startIndex = 0, 
    count = 20
): Post[] => {
    const postsArray: Post[] = [];
    
    // Create multiple groups of 5 posts (for the 3x2 grid)
    for (let groupIdx = 0; groupIdx < count; groupIdx++) {
        for (let postInGroupIdx = 0; postInGroupIdx < 5; postInGroupIdx++) {
            const absoluteIdx = startIndex + (groupIdx * 5) + postInGroupIdx;
            const isTrending = absoluteIdx % 10 === 0;

            // Generate images with appropriate dimensions
            const getImageUrl = () => {
                // For featured (large) images - use 1:2 ratio for tall images
                if (postInGroupIdx === 0) {
                    return `https://picsum.photos/400/800?random=${absoluteIdx}`;
                }
                // For regular images - use square images
                return `https://picsum.photos/400/400?random=${absoluteIdx}`;
            };

            postsArray.push({
                id: absoluteIdx.toString(),
                image: getImageUrl(),
                title: isTrending ? `Trending Topic #${Math.floor(absoluteIdx / 10) + 1}` : undefined,
                likes: Math.floor(Math.random() * 10000),
                comments: Math.floor(Math.random() * 1000),
                // First position in each group is always a video, others are not
                isVideo: postInGroupIdx === 0,
                duration: postInGroupIdx === 0 ? Math.floor(Math.random() * 180) + 30 : undefined,
                views: isTrending 
                    ? Math.floor(Math.random() * 1000000) + 500000 
                    : Math.floor(Math.random() * 500000),
                category: routes[Math.floor(Math.random() * routes.length)].key,
                trending: isTrending,
                trendingRank: isTrending ? Math.floor(absoluteIdx / 10) + 1 : undefined,
            });
        }
    }
    
    return postsArray;
}; 