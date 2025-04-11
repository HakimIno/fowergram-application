import React from 'react';
import { MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

// Define the main edit modes
export type EditMode = 'basic' | 'creative' | 'crop';

// Define the sub-modes for each edit mode
export type EditSubMode = 'filter' | 'adjust' | 'crop' | 'draw' | 'text' | 'effects';

// Tool interface for creative tools
export interface Tool {
  id: string;
  name: string;
  icon: (color: string) => React.ReactNode;
}

// Drawing colors array
export const DRAWING_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Magenta
  '#000000', // Black
  '#FFFFFF', // White
];

// Drawing tools
export const DRAWING_TOOLS: Tool[] = [
  { id: 'brush', name: 'พู่กัน', icon: (color) => <MaterialCommunityIcons name="brush" size={24} color={color} /> },
  { id: 'marker', name: 'มาร์คเกอร์', icon: (color) => <MaterialCommunityIcons name="marker" size={24} color={color} /> },
  { id: 'eraser', name: 'ยางลบ', icon: (color) => <MaterialCommunityIcons name="eraser" size={24} color={color} /> },
  { id: 'color', name: 'สี', icon: (color) => <FontAwesome name="paint-brush" size={24} color={color} /> },
];

// Text tools
export const TEXT_TOOLS: Tool[] = [
  { id: 'add-text', name: 'เพิ่มข้อความ', icon: (color) => <MaterialCommunityIcons name="format-text" size={24} color={color} /> },
  { id: 'sticker', name: 'สติกเกอร์', icon: (color) => <MaterialCommunityIcons name="sticker" size={24} color={color} /> },
  { id: 'font', name: 'แบบอักษร', icon: (color) => <MaterialCommunityIcons name="format-font" size={24} color={color} /> },
  { id: 'align', name: 'จัดแนว', icon: (color) => <MaterialCommunityIcons name="format-align-center" size={24} color={color} /> },
];

// Effects tools
export const EFFECTS_TOOLS: Tool[] = [
  { id: 'blur', name: 'เบลอ', icon: (color) => <MaterialCommunityIcons name="blur" size={24} color={color} /> },
  { id: 'neon', name: 'นีออน', icon: (color) => <Ionicons name="flash" size={24} color={color} /> },
  { id: 'glitter', name: 'กลิตเตอร์', icon: (color) => <FontAwesome name="star" size={24} color={color} /> },
  { id: 'shadow', name: 'เงา', icon: (color) => <MaterialCommunityIcons name="box-shadow" size={24} color={color} /> },
];

// Adjustment values interface
export interface AdjustmentValues {
  brightnessValue: number;
  contrastValue: number;
  saturationValue: number;
  temperatureValue: number;
  blurValue: number;
  highlightsValue: number;
  shadowsValue: number;
  vignetteValue: number;
  fadeValue: number;
  sharpenValue: number;
  structureValue: number;
  grainValue: number;
  tintValue: number;
} 