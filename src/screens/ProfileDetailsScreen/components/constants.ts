import { useMemo } from 'react';
import { Dimensions } from 'react-native';

// Screen dimensions
export const { width, height } = Dimensions.get("window");

// Section height constants
export const PROFILE_SECTION_HEIGHT = 150;
export const BIO_SECTION_HEIGHT = 70;
export const ACTION_SECTION_HEIGHT = 50;
export const TAB_BAR_HEIGHT = 48;

// Calculated header height
export const HEADER_HEIGHT
    = PROFILE_SECTION_HEIGHT +
    BIO_SECTION_HEIGHT +
    ACTION_SECTION_HEIGHT +
    (16 * 3);

// Tab definitions
export const TABS = [
    { name: "ทั้งหมด", title: "AllScreen", icon: "grid-outline", iconActive: "grid" },
    { name: "กดใจ", title: "HeartScreen", icon: "heart-outline", iconActive: "heart" },
    { name: "บันทึก", title: "BookingScreen", icon: "bookmark-outline", iconActive: "bookmark" }
];

// Image placeholder
export const PLACEHOLDER_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4'; 