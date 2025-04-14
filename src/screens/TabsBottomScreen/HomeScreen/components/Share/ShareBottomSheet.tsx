import React, { forwardRef, useCallback, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions, ScrollView } from 'react-native';
import { Portal } from 'react-native-portalize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'src/context/ThemeContext';
import BottomSheet, { BottomSheetMethods } from 'src/components/BottomSheet';
import { Ionicons } from '@expo/vector-icons';

export interface ShareBottomSheetMethods extends BottomSheetMethods {}

export interface ShareBottomSheetProps {
  handleClose: () => void;
}

// Mock data for share options
const SHARE_OPTIONS = [
  { id: 'copy', title: 'Copy', icon: 'link-outline' },
  { id: 'message', title: 'message', icon: 'chatbox-outline' },
  { id: 'email', title: 'email', icon: 'mail-outline' },
  { id: 'twitter', title: 'X', icon: 'logo-twitter' },
  { id: 'instagram', title: 'Instagram', icon: 'logo-instagram' },
  { id: 'facebook', title: 'Facebook', icon: 'logo-facebook' },
  { id: 'whatsapp', title: 'WhatsApp', icon: 'logo-whatsapp' },
  { id: 'telegram', title: 'Telegram', icon: 'paper-plane-outline' },
];

const ShareBottomSheet = forwardRef<ShareBottomSheetMethods, ShareBottomSheetProps>(
  ({ handleClose }, ref) => {
    const { isDarkMode } = useTheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = React.useRef<BottomSheetMethods>(null);
    const [isBottomSheetVisible, setIsBottomSheetVisible] = React.useState(false);

    useImperativeHandle(ref, () => ({
      expand: () => {
        bottomSheetRef.current?.expand();
        setIsBottomSheetVisible(true);
      },
      close: () => {
        setIsBottomSheetVisible(false);
        setTimeout(() => {
          bottomSheetRef.current?.close();
        }, 100);
      },
    }), []);

    const handleSheetClose = useCallback(() => {
      setIsBottomSheetVisible(false);
      setTimeout(() => {
        handleClose();
      }, 100);
    }, [handleClose]);

    const handleShareOptionPress = useCallback((optionId: string) => {
      // Handle different share options here
      console.log(`Share option pressed: ${optionId}`);
      
      // Close the bottom sheet after selecting an option
      bottomSheetRef.current?.close();
    }, []);

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          handleClose={handleSheetClose}
          title="Share to"
        >
          <View style={[
            styles.container, 
            { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' }
          ]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
              removeClippedSubviews={true}
              bounces={false}
              overScrollMode="never"
            >
              {SHARE_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.shareOption,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={() => handleShareOptionPress(option.id)}
                >
                  <View style={[
                    styles.iconContainer, 
                    { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }
                  ]}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={22} 
                      color={isDarkMode ? '#ffffff' : '#000000'} 
                    />
                  </View>
                  <Text style={[
                    styles.optionTitle,
                    { color: isDarkMode ? '#ffffff' : '#000000' }
                  ]}>
                    {option.title}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </BottomSheet>
      </Portal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
    height: Dimensions.get('window').height * 0.15,
  },
  scrollViewContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  shareOption: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    width: 80,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: "Chirp_Regular",
  },
});

export default ShareBottomSheet; 