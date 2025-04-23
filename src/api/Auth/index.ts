// api.js
import axios from 'axios';
import { Jwt, LoginUser } from 'src/interface';
import { httpEndpoint } from 'src/util/http';

export const login = async (credentials: LoginUser): Promise<Jwt> => {
    try {
        const payload = {
            identifier: credentials.identifier,
            password: credentials.password
        };
        
        if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_API === 'true') {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (credentials.identifier === 'test' && credentials.password === 'password') {
                        resolve({ token: 'mock-token-12345' });
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
        
        // ส่งข้อมูลไปยัง backend ในรูปแบบที่ถูกต้อง
        const response = await httpEndpoint.post('/api/v1/auth/login', payload);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export interface RegisterData {
    username: string;
    password: string;
    birth_date: string;
    email: string;
}

export const register = async (userData: RegisterData): Promise<Jwt> => {
    try {
        const dataToSend = {
            ...userData,
        };
        
        const response = await httpEndpoint.post('/api/v1/auth/register', dataToSend);
        return response.data;
    } catch (error) {
        throw error;
    }
};