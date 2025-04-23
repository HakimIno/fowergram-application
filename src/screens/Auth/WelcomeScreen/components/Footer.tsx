import { View, Text } from 'react-native';
import React from 'react';
import styles from '../style';

type FooterProps = {
  bottomPadding: number;
};

const Footer = ({ bottomPadding }: FooterProps) => {
  return (
    <View style={[styles.footer, { paddingBottom: bottomPadding || 20 }]}>
      <Text style={styles.footerText}>
        เมื่อดำเนินการต่อ คุณยอมรับนโยบายความเป็นส่วนตัว
      </Text>
      <Text style={styles.footerText}>
        และข้อกำหนดการใช้งานของเรา
      </Text>
    </View>
  );
};

export default Footer; 