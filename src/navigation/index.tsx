import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigation from './AppNavigation';

// กำหนด default theme ให้ Navigation Container
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF', // ปรับ background ให้เป็นสีขาว
    primary: '#000000', // สีหลัก
    card: '#FFFFFF', // สีพื้นหลังของการ์ด
    text: '#000000', // สีข้อความ
    border: '#F0F0F0', // สีขอบ
    notification: '#FF3B30', // สีการแจ้งเตือน
  },
};

const Navigation = () => {
  return (
    <NavigationContainer theme={AppTheme}>
      <AppNavigation />
    </NavigationContainer>
  );
}

export default Navigation;