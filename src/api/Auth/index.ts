// api.js
import axios from 'axios';
import { Jwt, LoginUser, Credentials } from 'src/interface';
import { httpEndpoint } from 'src/util/http';
export * from './accountApi';

/**
 * Authenticate user with provided credentials
 * @param credentials User login credentials
 * @returns JWT authentication data
 */
export const login = async (credentials: LoginUser): Promise<Jwt> => {
    try {
        const payload = {
            identifier: credentials.identifier,
            password: credentials.password
        };
        
        // Mock API for development environments
        if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (credentials.identifier === 'test' && credentials.password === 'password') {
                        resolve({ 
                            token: 'mock-token-12345',
                            refresh_token: 'mock-refresh-token-12345'
                        });
                    } else {
                        reject({ 
                            response: { 
                                status: 401, 
                                data: { message: 'ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง' } 
                            } 
                        });
                    }
                }, 1000);
            });
        }
        
        // Send credentials to backend
        const response = await httpEndpoint.post('/api/v1/auth/login', payload);
        
        // Add safety checks for API response format
        if (!response || !response.data) {
            throw new Error('ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์');
        }
        
        // If the response is not in the expected format, try to normalize it
        const data = response.data;
        
        // Handle format from the curl example: 
        // {"status":"success","code":"LOGIN_SUCCESS","message":"Login successful","data":{"token":"xxx","refresh_token":"xxx","user":{...}}}
        if (data.status === 'success' && data.data) {
            return data;
        }
        
        // New API format with data.token and data.user
        if (data.data && data.data.token) {
            return data;
        }
        
        // Legacy API format with direct token
        if (typeof data.token === 'string') {
            return {
                token: data.token,
                refresh_token: data.refresh_token
            };
        }
        
        // Unknown format - log for debugging and throw error
        console.error('Unexpected login response format:', JSON.stringify(data));
        throw new Error('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง');
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export interface RegisterData {
    username: string;
    password: string;
    birth_date: string;
    email: string;
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns JWT authentication data for the new user
 */
export const register = async (userData: RegisterData): Promise<Jwt> => {
    try {
        const dataToSend = {
            ...userData,
        };
        
        const response = await httpEndpoint.post('/api/v1/auth/register', dataToSend);
        
        // Add safety checks for API response format
        if (!response || !response.data) {
            throw new Error('ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์');
        }
        
        const data = response.data;
        console.log('Register API response:', JSON.stringify(data));
        
        // Server returned successful registration with user data but no token 
        // (Found in logs: user object but no token)
        if (data.status === 'success' && data.data && data.data.user && !data.data.token) {
            console.log('Registration successful with user data but no token - proceed to login');
            return {
                status: 'success',
                message: 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ',
                code: 'REGISTER_SUCCESS_NO_TOKEN'
                // Don't include data to avoid type errors
            };
        }
        
        // Server sent success status but no token (common for 201 responses)
        if ((response.status === 201 || data.status === 'success') && !data.data && !data.token) {
            console.log('Registration successful but no token returned - proceed to login');
            return {
                status: 'success',
                message: 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ',
                code: 'REGISTER_SUCCESS_NO_TOKEN'
            };
        }
        
        // Handle success format with data property
        if (data.status === 'success' && data.data) {
            return data;
        }
        
        // Handle direct data format
        if (data.data && data.data.token) {
            return data;
        }
        
        // Legacy format with direct token
        if (typeof data.token === 'string') {
            return {
                token: data.token
            };
        }
        
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

/**
 * Refresh access token using refresh token
 * @param refreshToken The refresh token to use
 * @returns New tokens (access and refresh)
 */
export const refreshToken = async (refreshToken: string): Promise<Credentials> => {
    try {
        console.log('Calling refresh token API with token length:', refreshToken?.length || 0);
        
        const response = await httpEndpoint.post('/api/v1/auth/refresh-token', {
            refresh_token: refreshToken
        });
        
        if (!response || !response.data) {
            throw new Error('ได้รับข้อมูลไม่ถูกต้องจากเซิร์ฟเวอร์');
        }
        
        console.log('Refresh token response keys:', Object.keys(response.data));
        const data = response.data;
        
        // Handle data in different formats
        if (data.data && data.data.token && data.data.refresh_token) {
            console.log('Found valid data in data.data format');
            return {
                token: data.data.token,
                refresh_token: data.data.refresh_token,
                user: data.data.user
            };
        }
        
        if (data.token && data.refresh_token && data.user) {
            console.log('Found valid data in direct format');
            return {
                token: data.token,
                refresh_token: data.refresh_token,
                user: data.user
            };
        }
        
        console.error('Unexpected refresh token response format:', JSON.stringify(data));
        throw new Error('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง');
    } catch (error) {
        console.error('Refresh token error:', error);
        throw error;
    }
};