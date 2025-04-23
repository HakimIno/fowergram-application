import { View, Text } from 'react-native';
import React from 'react';
import FlowergramLogo from 'src/components/FlowergramLogo';
import styles from '../style';

type LogoProps = {
  hasAccounts: boolean;
};

const Logo = ({ hasAccounts }: LogoProps) => {
  return (
    <View style={styles.logoContainer}>
      <FlowergramLogo
        width={250}
        height={80}
        fontSize={45}
        theme={{ textColor: "#000" }}
      />
      <Text style={styles.subtitleText}>
        {hasAccounts 
          ? 'เลือกบัญชีเพื่อดำเนินการต่อ' 
          : 'ยินดีต้อนรับสู่ Flowergram'}
      </Text>
    </View>
  );
};

export default Logo; 