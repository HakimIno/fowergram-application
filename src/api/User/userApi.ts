import { httpEndpoint } from 'src/util/http';
import { UserDetails } from 'src/interface';

/**
 * Get the current user's profile
 * @param token JWT token for authentication
 * @param refreshToken Optional refresh token to use if access token expired
 * @returns User profile data
 */
export const getUserProfile = async (token: string, refreshToken?: string): Promise<{ user: UserDetails }> => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('ไม่มี token สำหรับการยืนยันตัวตน');
    }
    
    console.log('Fetching user profile with token length:', token.length);
    
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };
    
    // ถ้ามี refresh token ส่งไปด้วย
    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }
    
    try {
      const response = await httpEndpoint.get('/api/v1/users/me', { headers });
      
      // Safety checks
      if (!response || !response.data) {
        throw new Error('ไม่ได้รับข้อมูลจากเซิร์ฟเวอร์');
      }
      
      const data = response.data;
      console.log('User profile API response keys:', Object.keys(data));
      
      // Handle different response formats
      
      // Format 1: { user: UserDetails }
      if (data.user && typeof data.user === 'object') {
        console.log('Found user data in .user property');
        validateUserData(data.user);
        return { user: data.user };
      }
      
      // Format 2: { data: { user: UserDetails } }
      if (data.data && data.data.user && typeof data.data.user === 'object') {
        console.log('Found user data in .data.user property');
        validateUserData(data.data.user);
        return { user: data.data.user };
      }
      
      // Format 3: Direct user object with required fields
      if (data.id && data.username && data.email) {
        console.log('Found user data in direct object');
        validateUserData(data);
        return { user: data };
      }
      
      // Unknown format
      console.error('Unexpected profile response format:', JSON.stringify(data, null, 2));
      throw new Error('รูปแบบข้อมูลโปรไฟล์ไม่ถูกต้อง');
    } catch (error: any) {
      // ถ้าได้รับ error 401 และมี refresh token ให้ทำการ refresh token ก่อน
      if (error?.response?.status === 401 && refreshToken) {
        console.log('Access token expired, attempting to refresh token...');
        // นำเข้าฟังก์ชัน refreshToken โดยตรงเพื่อหลีกเลี่ยง circular dependency
        const { refreshToken: refreshTokenFunc } = require('src/api/Auth');
        
        try {
          // เรียกใช้ refreshToken function
          const newTokens = await refreshTokenFunc(refreshToken);
          
          if (newTokens && newTokens.token) {
            console.log('Token refreshed successfully, retrying user profile fetch');
            // เรียกใช้ getUserProfile อีกครั้งด้วย token ใหม่
            return await getUserProfile(newTokens.token, newTokens.refresh_token);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          throw new Error('ไม่สามารถต่ออายุ token ได้');
        }
      }
      
      // ถ้าไม่ใช่กรณี token หมดอายุหรือไม่มี refresh token ส่งต่อ error
      throw error;
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

/**
 * Validates user data has required fields
 * @param user User data to validate
 * @throws Error if user data is invalid
 */
function validateUserData(user: any): asserts user is UserDetails {
  if (!user.id || typeof user.id !== 'number') {
    throw new Error('ข้อมูลผู้ใช้ไม่ถูกต้อง: ไม่มี ID');
  }
  
  if (!user.username || typeof user.username !== 'string') {
    throw new Error('ข้อมูลผู้ใช้ไม่ถูกต้อง: ไม่มีชื่อผู้ใช้');
  }
  
  if (!user.email || typeof user.email !== 'string') {
    throw new Error('ข้อมูลผู้ใช้ไม่ถูกต้อง: ไม่มีอีเมล');
  }
} 