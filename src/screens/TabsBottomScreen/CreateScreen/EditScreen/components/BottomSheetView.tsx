import React, { ReactNode, useMemo, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { SlideInDown, SlideOutDown, FadeIn } from 'react-native-reanimated';
import { EditMode, EditSubMode } from '../types';
import { DraggableBottomSheet } from './BottomSheet';
import { BottomSheetContent } from './BottomSheetContent';
import { MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// กำหนดความสูงคงที่ของ bottom sheet ให้ตรงกับไฟล์อื่น ๆ
const FIXED_SHEET_HEIGHT = Dimensions.get('window').height * 0.35;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface BottomSheetViewProps {
  editMode: EditMode;
  editSubMode: EditSubMode;
  switchEditMode: (mode: EditMode, subMode: EditSubMode) => void;
  currentBottomSheetHeight: number;
  onHeightChange: (height: number) => void;
  isCreativeMode: boolean;
  renderCreativeToolbar: () => ReactNode;
  renderContent: () => ReactNode;
}

export const BottomSheetView: React.FC<BottomSheetViewProps> = ({
  editMode,
  editSubMode,
  switchEditMode,
  onHeightChange,
  isCreativeMode,
  renderCreativeToolbar,
  renderContent
}) => {
  // Reference to ScrollView for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Define the main tabs with enhanced icons and organization
  const mainTabs = useMemo(() => [
    {
      id: 'filter' as const,
      name: 'ฟิลเตอร์',
      icon: (color: string) => <MaterialCommunityIcons name="image-filter-frames" size={22} color={color} />,
      mode: 'basic' as const,
      subMode: 'filter' as const,
    },
    {
      id: 'adjust' as const,
      name: 'ปรับแต่ง',
      icon: (color: string) => <Feather name="sliders" size={22} color={color} />,
      mode: 'basic' as const,
      subMode: 'adjust' as const,
    },
    {
      id: 'crop' as const,
      name: 'ครอป',
      icon: (color: string) => <Feather name="crop" size={22} color={color} />,
      mode: 'crop' as const,
      subMode: 'crop' as const,
    },
    {
      id: 'draw' as const,
      name: 'วาด',
      icon: (color: string) => <MaterialCommunityIcons name="brush" size={22} color={color} />,
      mode: 'creative' as const,
      subMode: 'draw' as const,
    },
    {
      id: 'text' as const,
      name: 'ข้อความ',
      icon: (color: string) => <MaterialCommunityIcons name="format-text" size={22} color={color} />,
      mode: 'creative' as const,
      subMode: 'text' as const,
    },
    {
      id: 'effects' as const,
      name: 'เอฟเฟกต์',
      icon: (color: string) => <MaterialCommunityIcons name="star-four-points" size={22} color={color} />,
      mode: 'creative' as const,
      subMode: 'effects' as const,
    }
  ], []);

  // Calculate approximate tab positions for programmatic scrolling
  const tabPositions = useMemo(() => {
    const positions: { [key: string]: number } = {};
    let position = 0;
    mainTabs.forEach((tab, index) => {
      positions[tab.id] = position;
      // TAB_WIDTH(100) + GAP(10) = 110 (approximate width of each tab item)
      position += 110;
    });
    return positions;
  }, [mainTabs]);

  // Handle tab selection with animation
  const handleTabPress = (tab: typeof mainTabs[0]) => {
    // Trigger layout animation for smooth transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Switch tab mode
    switchEditMode(tab.mode, tab.subMode);

    // Scroll to the selected tab
    if (scrollViewRef.current) {
      const position = tabPositions[tab.id];
      const centerOffset = (SCREEN_WIDTH / 2) - 60; // Half screen width minus half tab width
      const scrollToX = Math.max(0, position - centerOffset);

      scrollViewRef.current.scrollTo({
        x: scrollToX,
        animated: true
      });
    }
  };

  return (
    <Animated.View
      entering={SlideInDown.duration(300).springify()}
      exiting={SlideOutDown.duration(200)}
      style={styles.bottomSheetContainer}
    >
      <DraggableBottomSheet
        initialHeight={FIXED_SHEET_HEIGHT}
        onHeightChange={onHeightChange}
      >
        <BottomSheetContent>
          <ScrollView
            ref={scrollViewRef}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={styles.tabScrollView}
            contentContainerStyle={styles.tabScrollContent}
            scrollEventThrottle={16}
            bounces={false}  // ปิดการกระเด้ง
            nestedScrollEnabled={true}
            disableIntervalMomentum={false}
          >
            {mainTabs.map((tab) => {
              const isActive = editMode === tab.mode && editSubMode === tab.subMode;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive
                  ]}
                  onPress={() => handleTabPress(tab)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tabIconContainer}>
                    {tab.icon(isActive ? '#3897f0' : '#fff')}
                  </View>
                  <Text style={[
                    styles.tabText,
                    isActive && styles.tabTextActive
                  ]}>
                    {tab.name}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Content based on selected mode */}
          <View style={styles.editContentContainer}>
            {/* Creative controls for drawing/text/effects */}
            {isCreativeMode && (
              <View style={styles.creativeControlsContainer}>
                {renderCreativeToolbar()}
              </View>
            )}

            {/* Main content container */}
            <View style={styles.mainContentContainer}>
              {renderContent()}
            </View>
          </View>
        </BottomSheetContent>
      </DraggableBottomSheet>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 90,
  },
  tabsBlurContainer: {
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  tabScrollView: {
    flexGrow: 0,
    height: 56, // กำหนดความสูงคงที่เพื่อป้องกันการเปลี่ยนขนาด
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    position: 'relative',
    minWidth: 90,
    justifyContent: 'center',
    height: 40, // กำหนดความสูงคงที่
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 151, 240, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 151, 240, 0.3)',
  },
  tabIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#3897f0',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#3897f0',
    borderRadius: 1,
  },
  editContentContainer: {
    flex: 1,
  },
  creativeControlsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 6,
  },
  mainContentContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 4,
  },
}); 