import { CommentType } from './types';

export const MOCK_COMMENTS: CommentType[] = [
    {
        id: '1',
        username: 'user_one',
        avatar: 'https://picsum.photos/id/1/200',
        comment: 'This is amazing! Love the design and concept.',
        time: '2h',
        likes: 24,
        isLiked: false,
        _showAllReplies: false,
        replies: [
            {
                id: '1-1',
                username: 'design_lover',
                avatar: 'https://picsum.photos/id/2/200',
                comment: 'I agree! The colors are so vibrant. Where did you get inspiration from?',
                time: '1h',
                likes: 15,
                isLiked: false,
            }
        ]
    },
    {
        id: '2',
        username: 'creative_mind',
        avatar: 'https://picsum.photos/id/3/200',
        comment: 'I need more content like this! Following you right away.',
        time: '45m',
        likes: 32,
        isLiked: true,
        replies: []
    },
    {
        id: '3',
        username: 'artsy_soul',
        avatar: 'https://picsum.photos/id/4/200',
        comment: 'This reminds me of modern art pieces I saw in the museum last week.',
        time: '30m',
        likes: 8,
        isLiked: false,
        replies: [
            {
                id: '3-1',
                username: 'tech_enthusiast',
                avatar: 'https://picsum.photos/id/5/200',
                comment: 'The symmetry is perfect! Did you use any special tools?',
                time: '15m',
                likes: 19,
                isLiked: false,
            },
            {
                id: '3-2',
                username: 'fashion_forward',
                avatar: 'https://picsum.photos/id/7/200',
                comment: 'Love how you have combined these elements. Very trendy yet timeless!',
                time: '5m',
                likes: 14,
                isLiked: false,
            },
            {
                id: '3-3',
                username: 'hakim_dev',
                avatar: 'https://picsum.photos/id/7/200',
                comment: 'Love how you have combined these elements. Very trendy yet timeless!',
                time: '5m',
                likes: 20,
                isLiked: false,
            },
            {
                id: '3-4',
                username: 'Snoop_dog',
                avatar: 'https://picsum.photos/id/7/200',
                comment: 'Love how you have combined these elements. Very trendy yet timeless!',
                time: '5m',
                likes: 12,
                isLiked: false,
            }
        ]
    },
    {
        id: '4',
        username: 'travel_enthusiast',
        avatar: 'https://picsum.photos/id/6/200',
        comment: 'สวัสดีฮะ พอดีช่วงเช้านี้ได้โอกาสเข้าไปที่ตอนเปิดงานของ ',
        time: '10m',
        likes: 27,
        isLiked: false,
        replies: []
    },
    {
        id: '5',
        username: 'ui_designer',
        avatar: 'https://picsum.photos/id/5/200',
        comment: 'Great interface design! I love the color palette choices.',
        time: '3h',
        likes: 42,
        isLiked: false,
        replies: []
    },
    {
        id: '6',
        username: 'ux_expert',
        avatar: 'https://picsum.photos/id/9/200',
        comment: 'The user flow is intuitive. Really well thought out!',
        time: '4h',
        likes: 38,
        isLiked: false,
        replies: []
    }
]; 