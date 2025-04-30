import { SkPath } from '@shopify/react-native-skia';
import { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Point coordinates
export interface Point {
    x: number;
    y: number;
}

// Drawing path with properties
export interface DrawingPath {
    path: SkPath;
    color: string;
    strokeWidth: number;
    strokeStyle: StrokeStyleType;
}

// Editor component props
export interface EditorPhotoProps {
    imageUri: string;
    onSave?: (uri: string) => void;
}

// Available stroke styles
export type StrokeStyleType =
    | 'solid'
    | 'dashed'
    | 'dotted'
    | 'double'
    | 'zigzag'
    | 'wavy'
    | 'gradient';

// Stroke style option with icon
export interface StrokeStyleOption {
    type: StrokeStyleType;
    icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
} 