import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import styles from '../style';

type ButtonSectionProps = {
  hasAccounts: boolean;
  onLoginPress: () => void;
  onRegisterPress: () => void;
};

const ButtonSection = ({
  hasAccounts,
  onLoginPress,
  onRegisterPress
}: ButtonSectionProps) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={onRegisterPress}
        activeOpacity={0.8}
      >
        <Text style={styles.registerButtonText}>สร้างบัญชีใหม่</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={onLoginPress}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>
          {hasAccounts ? 'เข้าสู่ระบบด้วยบัญชีอื่น' : 'เข้าสู่ระบบ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonSection; 