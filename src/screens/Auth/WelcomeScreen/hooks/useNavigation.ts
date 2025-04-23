import * as Haptics from 'expo-haptics';
import { WelcomeNavigationProp } from '../index';

export const useWelcomeNavigation = (navigation: WelcomeNavigationProp) => {
  const handleLoginPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('login_screen');
  };

  const handleRegisterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('register_screen');
  };

  return {
    handleLoginPress,
    handleRegisterPress
  };
}; 