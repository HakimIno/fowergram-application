import { AxiosError } from 'axios';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

/**
 * Convert API errors to user-friendly messages
 * @param error Error object from API call
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  // Check if it's an Axios error
  if (error?.isAxiosError) {
    const axiosError = error as AxiosError;
    
    // Network errors
    if (!axiosError.response) {
      return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }
    
    // Server returned an error
    if (axiosError.response) {
      // Check for specific error message in response
      const responseData = axiosError.response.data as any;
      if (responseData?.message) {
        return responseData.message;
      }
      
      // HTTP status code based messages
      switch (axiosError.response.status) {
        case 400:
          return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง';
        case 401:
          return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        case 403:
          return 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
        case 404:
          return 'ไม่พบข้อมูลที่ต้องการ';
        case 408:
          return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง';
        case 500:
        case 502:
        case 503:
          return 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง';
        default:
          return `เกิดข้อผิดพลาด: ${axiosError.response.status}`;
      }
    }
  }
  
  // Check if error has a message property
  if (error?.message) {
    return error.message;
  }
  
  // Generic error
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง';
};

/**
 * Show error alert with haptic feedback
 * @param title Alert title
 * @param message Error message
 */
export const showErrorAlert = (title: string, message: string): void => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  Alert.alert(title, message);
};

/**
 * Handle API errors with proper UI feedback
 * @param error Error object
 * @param title Alert title
 */
export const handleApiError = (error: any, title = 'ข้อผิดพลาด'): void => {
  console.error('API Error:', error);
  const message = getErrorMessage(error);
  showErrorAlert(title, message);
}; 