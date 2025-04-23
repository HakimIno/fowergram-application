import { useMutation } from '@tanstack/react-query';
import { Credentials, LoginUser, Jwt } from 'src/interface';
import { RegisterData, register } from 'src/api/Auth';
import { httpEndpoint } from 'src/util/http';
import { storeCredentials } from './storage';

/**
 * Hook for login mutation
 */
export const useLoginMutation = (
  onSuccess: (credentials: Credentials) => void,
  onError: (error: any, errorMsg: string) => void
) => {
  return useMutation<any, { message: any; }, LoginUser>({
    mutationFn: (loginUser: LoginUser) => httpEndpoint.post('/api/v1/auth/login', loginUser)
      .then(response => response.data),
    onSuccess: (response: any) => {
      console.log('Login API response:', JSON.stringify(response, null, 2));
      
      // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
      if (!response) {
        console.error('Login response is empty');
        onError(new Error('Empty response'), 'ไม่ได้รับข้อมูลจากเซิร์ฟเวอร์');
        return;
      }
      
      // กรณี API ส่งข้อมูลกลับมาในรูปแบบที่มี wrapper (status, code, message, data)
      let credentials: Credentials;
      
      if (response.data && (response.status === 'success' || response.code === 'LOGIN_SUCCESS')) {
        // กรณีมี data wrapper
        const { token, user } = response.data;
        
        if (!token || !user) {
          console.error('Login response missing token or user:', response);
          onError(
            new Error('Invalid response format'), 
            'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง ลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'
          );
          return;
        }
        
        credentials = { token, user };
      } else if (response.token && response.user) {
        // กรณีไม่มี data wrapper (รูปแบบเดิม)
        credentials = response as Credentials;
      } else {
        console.error('Unexpected login response format:', response);
        onError(
          new Error('Unexpected response format'), 
          'รูปแบบข้อมูลไม่ถูกต้อง ลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'
        );
        return;
      }
      
      console.log('Parsed credentials:', JSON.stringify(credentials, null, 2));
      
      // Store credentials securely
      storeCredentials(credentials);
      onSuccess(credentials);
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      // จัดการกับข้อผิดพลาดต่างๆ ให้เป็นข้อความที่เข้าใจง่าย
      let errorMsg = 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง';
      
      // กรณี error จาก axios
      if (error.response) {
        // มีการตอบกลับจาก server พร้อมสถานะ error
        if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          switch (error.response.status) {
            case 400:
              errorMsg = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
              break;
            case 401:
              errorMsg = 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง';
              break;
            case 404:
              errorMsg = 'ไม่พบบริการเข้าสู่ระบบ กรุณาติดต่อผู้ดูแลระบบ';
              break;
            case 500:
              errorMsg = 'เซิร์ฟเวอร์ผิดพลาด กรุณาลองใหม่ภายหลัง';
              break;
            default:
              errorMsg = `เกิดข้อผิดพลาด (${error.response.status})`;
          }
        }
      } else if (error.request) {
        // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
        errorMsg = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย';
      } else {
        // มีบางอย่างผิดพลาดในการตั้งค่าคำขอ
        errorMsg = error.message || errorMsg;
      }
      
      onError(error, errorMsg);
    },
  });
};

/**
 * Hook for register mutation
 */
export const useRegisterMutation = (
  onSuccess: (data: Jwt) => void,
  onError: (error: any, errorMsg: string) => void
) => {
  return useMutation<any, { message: any; }, RegisterData>({
    mutationFn: register,
    onSuccess: (response: any) => {
      console.log('Register API response:', JSON.stringify(response, null, 2));
      
      // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
      if (!response) {
        console.error('Register response is empty');
        onError(new Error('Empty response'), 'ไม่ได้รับข้อมูลจากเซิร์ฟเวอร์');
        return;
      }
      
      // กรณี API ส่งข้อมูลกลับมาในรูปแบบที่มี wrapper (status, code, message, data)
      let jwtData: Jwt;
      
      if (response.data && (response.status === 'success' || response.code === 'REGISTER_SUCCESS')) {
        // กรณีมี data wrapper
        if (response.data.token) {
          jwtData = { token: response.data.token };
        } else {
          console.error('Register response missing token:', response);
          onError(
            new Error('Invalid response format'), 
            'ข้อมูลการลงทะเบียนไม่ถูกต้อง ลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'
          );
          return;
        }
      } else if (response.token) {
        // กรณีไม่มี data wrapper (รูปแบบเดิม)
        jwtData = { token: response.token };
      } else {
        console.error('Unexpected register response format:', response);
        onError(
          new Error('Unexpected response format'), 
          'รูปแบบข้อมูลไม่ถูกต้อง ลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ'
        );
        return;
      }
      
      onSuccess(jwtData);
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      
      // จัดการกับข้อผิดพลาดต่างๆ ให้เป็นข้อความที่เข้าใจง่าย
      let errorMsg = 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง';
      
      // กรณี error จาก axios
      if (error.response) {
        // มีการตอบกลับจาก server พร้อมสถานะ error
        if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          switch (error.response.status) {
            case 400:
              errorMsg = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
              break;
            case 401:
              errorMsg = 'ไม่มีสิทธิ์เข้าถึง กรุณาลองใหม่อีกครั้ง';
              break;
            case 404:
              errorMsg = 'ไม่พบบริการลงทะเบียน กรุณาติดต่อผู้ดูแลระบบ';
              break;
            case 409:
              errorMsg = 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น';
              break;
            case 500:
              errorMsg = 'เซิร์ฟเวอร์ผิดพลาด กรุณาลองใหม่ภายหลัง';
              break;
            default:
              errorMsg = `เกิดข้อผิดพลาด (${error.response.status})`;
          }
        }
      } else if (error.request) {
        // ส่งคำขอแล้วแต่ไม่ได้รับการตอบกลับ
        errorMsg = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย';
      } else {
        // มีบางอย่างผิดพลาดในการตั้งค่าคำขอ
        errorMsg = error.message || errorMsg;
      }
      
      onError(error, errorMsg);
    },
  });
}; 