// Constants used throughout the EditScreen component
export const CONSTANTS = {
  // Animation durations
  ANIMATION: {
    FADE_IN: 200,
    FADE_OUT: 150,
    SLIDE_IN_DOWN: 300,
    SLIDE_OUT_DOWN: 200,
    SPRING_CONFIG: { damping: 15, stiffness: 150 }
  },
  
  // Screen dimensions
  HEADER_HEIGHT: 60,
  BOTTOM_SHEET_DEFAULT_HEIGHT: 0.4, // 40% of screen height
  
  // Timing constants
  AUTO_HIDE_DELAY: 3000, // ms
  
  // Gesture constraints
  GESTURE: {
    MIN_SCALE: 0.5,
    MAX_SCALE: 5,
    MAX_TRANSLATE_MULTIPLIER: 0.8
  },
  
  // UI configuration
  UI: {
    BUTTON_SIZE: 40,
    GRADIENT_HEIGHT: 120,
    BUTTON_BORDER_RADIUS: 20
  },
  
  // Colors
  COLORS: {
    BACKGROUND: '#000',
    BUTTON_BACKGROUND: 'rgba(0, 0, 0, 0.4)',
    BUTTON_BORDER: 'rgba(255, 255, 255, 0.2)',
    ICON_COLOR: '#fff',
    GRADIENT_TOP: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent'],
    GRADIENT_BOTTOM: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']
  }
}; 