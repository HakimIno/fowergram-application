import { SkPath } from '@shopify/react-native-skia';
import { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Point coordinates
export interface Point {
    x: number;
    y: number;
}

// Tool mode (drawing or erasing)
export type ToolMode = 'draw' | 'erase';

// Drawing path with properties
export interface DrawingPath {
    path: SkPath;
    color: string;
    strokeWidth: number;
    strokeStyle: StrokeStyleType;
    mode: ToolMode;
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
    | 'heart'
    | 'flower'
    | 'star';

// Stroke style option with icon
export interface StrokeStyleOption {
    type: StrokeStyleType;
    icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
    label: string;
} 