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

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`
    };

    if (refreshToken) {
      headers['X-Refresh-Token'] = refreshToken;
    }

    try {
      const response = await httpEndpoint.get('/api/v1/users/me', { headers });

      if (!response || !response.data) {
        throw new Error('ไม่ได้รับข้อมูลจากเซิร์ฟเวอร์');
      }

      const data = response.data;

      if (data.user && typeof data.user === 'object') {
        validateUserData(data.user);
        return { user: data.user };
      }

      if (data.data && data.data.user && typeof data.data.user === 'object') {
        validateUserData(data.data.user);
        return { user: data.data.user };
      }

      if (data.id && data.username && data.email) {
        validateUserData(data);
        return { user: data };
      }

      console.error('Unexpected profile response format:', JSON.stringify(data, null, 2));
      throw new Error('รูปแบบข้อมูลโปรไฟล์ไม่ถูกต้อง');
    } catch (error: any) {
      if (error?.response?.status === 401 && refreshToken) {
        const { refreshToken: refreshTokenFunc } = require('src/api/Auth');

        try {
          const newTokens = await refreshTokenFunc(refreshToken);

          if (newTokens && newTokens.token) {
            return await getUserProfile(newTokens.token, newTokens.refresh_token);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          throw new Error('ไม่สามารถต่ออายุ token ได้');
        }
      }

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