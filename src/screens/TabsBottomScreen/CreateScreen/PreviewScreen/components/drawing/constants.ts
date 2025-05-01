import { Dimensions } from 'react-native';
import { StrokeStyleOption } from './types';

// Screen dimensions
export const { width, height } = Dimensions.get('window');

// Available drawing colors - Pastel palette
export const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // yellow
    '#84cc16', // green
    '#22c55e', // emerald
    '#0ea5e9', // blue
    '#ef4444', // red
    '#FFB6C1', // pastel pink
    '#FFD700', // pastel yellow
    '#98FB98', // pastel green
    '#87CEFA', // pastel blue
    '#DDA0DD', // pastel purple
    '#FFDAB9', // pastel peach
    '#E6E6FA', // pastel lavender
    '#FFFFFF', // white
    '#000000', // black

];

// Available stroke widths
export const STROKE_WIDTHS = [2, 4, 6, 8, 10];

// Available stroke styles with icons
export const STROKE_STYLES: StrokeStyleOption[] = [
    { type: 'solid', icon: 'minus', label: 'Solid' },
    { type: 'dashed', icon: 'dots-horizontal', label: 'Dashed' },
    { type: 'dotted', icon: 'dots-horizontal', label: 'Dotted' },
    { type: 'heart', icon: 'heart', label: 'Heart' },
    { type: 'flower', icon: 'flower', label: 'Flower' },
    { type: 'star', icon: 'star', label: 'Star' },
]; 