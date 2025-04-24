import { httpEndpoint } from 'src/util/http';
import { Credentials } from 'src/interface';

export interface SwitchAccountTokenRequest {
  switch_type: 'token';
  identifier: string;
  stored_token: string;
  refresh_token?: string;
}

export interface SwitchAccountPasswordRequest {
  switch_type: 'password';
  identifier: string;
  password: string;
}

export type SwitchAccountRequest = SwitchAccountTokenRequest | SwitchAccountPasswordRequest;

/**
 * Switch to another account using either token or password
 * @param currentToken Current user's JWT token
 * @param request Switch account request
 * @param deviceId Optional device ID
 * @returns New credentials for the switched account
 */
export const switchAccount = async (
  currentToken: string,
  request: SwitchAccountRequest,
  deviceId?: string
): Promise<Credentials> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // ตรวจสอบและจัดรูปแบบ Authorization header ให้ถูกต้อง
    if (currentToken) {
      // ถ้า token ไม่ได้เริ่มต้นด้วย 'Bearer ' ให้เติมให้
      if (!currentToken.startsWith('Bearer ')) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      } else {
        headers['Authorization'] = currentToken;
      }
    }
    
    // Add Device-ID header if provided
    if (deviceId) {
      headers['Device-ID'] = deviceId;
    }
    
    // ถ้า request มี refresh token (กรณี token-based switching)
    if ('refresh_token' in request && request.refresh_token) {
      headers['X-Refresh-Token'] = request.refresh_token;
    }
    
    console.log('Sending request with headers:', headers);
    const response = await httpEndpoint.post('/api/v1/auth/switch-account', request, { headers });
    
    // ตรวจสอบรูปแบบข้อมูลที่ได้รับ
    const data = response.data;
    
    // Format 1: { token: string, refresh_token: string, user: UserDetails }
    if (data.token && data.user) {
      return {
        token: data.token,
        refresh_token: data.refresh_token,
        user: data.user
      };
    }
    
    // Format 2: { data: { token: string, refresh_token: string, user: UserDetails } }
    if (data.data && data.data.token && data.data.user) {
      return {
        token: data.data.token,
        refresh_token: data.data.refresh_token,
        user: data.data.user
      };
    }
    
    console.error('Unexpected response format:', JSON.stringify(data));
    throw new Error('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง');
  } catch (error) {
    console.error('Failed to switch account:', error);
    throw error;
  }
}; 