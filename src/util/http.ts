import axios, { AxiosError, AxiosResponse } from "axios";
import { refreshToken } from "src/api/Auth";
import { storage } from "src/utils/auth";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const getActiveUserRefreshToken = (): { userId: number | null, refreshToken: string | null } => {
    try {
        const activeAccountId = storage.getNumber('auth_active_account');
        if (!activeAccountId) return { userId: null, refreshToken: null };

        const accountKey = `auth_account_${activeAccountId}`;
        const accountJson = storage.getString(accountKey);
        if (!accountJson) return { userId: null, refreshToken: null };

        const account = JSON.parse(accountJson);
        return {
            userId: activeAccountId,
            refreshToken: account.refresh_token || null
        };
    } catch (error) {
        console.error('Error getting refresh token:', error);
        return { userId: null, refreshToken: null };
    }
};

const subscribeToTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const notifySubscribersAboutNewToken = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

export const httpEndpoint = axios.create({
    baseURL: "http://192.168.95.186:8080",
    timeout: 30 * 1000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

httpEndpoint.interceptors.request.use(
    async (config) => {
        if (config.url === '/api/v1/auth/refresh-token') {
            return config;
        }

        if (config.headers && config.headers.Authorization) {
            const authHeader = config.headers.Authorization as string;

            if (authHeader && !authHeader.startsWith('Bearer ') && authHeader.trim().length > 0) {
                console.log('Adding Bearer prefix to Authorization header');
                config.headers.Authorization = `Bearer ${authHeader}`;
            }

            if (authHeader === '' || authHeader === 'Bearer ' || authHeader === 'Bearer null' || authHeader === 'Bearer undefined') {
                console.log('Removing invalid Authorization header');
                delete config.headers.Authorization;
            }
        }

        // ตรวจสอบว่ามี token refresh ที่กำลังดำเนินการอยู่หรือไม่
        if (isRefreshing) {
            // ถ้ามีการ refresh token อยู่แล้ว รอจนกว่าจะได้ token ใหม่
            return new Promise((resolve) => {
                subscribeToTokenRefresh((token) => {
                    if (config.headers) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    resolve(config);
                });
            });
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

httpEndpoint.interceptors.response.use(
    (response: AxiosResponse) => {
        if (!response.data) {
            response.data = {};
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 &&
            originalRequest &&
            !(originalRequest as any)._retry &&
            originalRequest.url !== '/api/v1/auth/refresh-token') {

            (originalRequest as any)._retry = true;

            const { userId, refreshToken: userRefreshToken } = getActiveUserRefreshToken();

            if (!userRefreshToken) {
                console.log('No refresh token available, rejecting request');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                try {
                    return new Promise((resolve, reject) => {
                        subscribeToTokenRefresh((token) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(axios(originalRequest));
                        });
                    });
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            // เริ่มกระบวนการ refresh token
            isRefreshing = true;

            try {
                console.log('Attempting to refresh token...');
                // เรียกใช้ API refresh token
                const tokenResponse = await refreshToken(userRefreshToken);

                if (tokenResponse && tokenResponse.token) {
                    // อัปเดต token ใน header ของ request เดิม
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${tokenResponse.token}`;
                    }

                    // บันทึก token ใหม่ลงใน storage
                    if (userId) {
                        const accountKey = `auth_account_${userId}`;
                        const accountJson = storage.getString(accountKey);

                        if (accountJson) {
                            const account = JSON.parse(accountJson);
                            account.token = tokenResponse.token;
                            account.refresh_token = tokenResponse.refresh_token;
                            storage.set(accountKey, JSON.stringify(account));
                        }
                    }

                    console.log('Token refreshed successfully');
                    notifySubscribersAboutNewToken(tokenResponse.token);

                    isRefreshing = false;

                    return axios(originalRequest);
                } else {
                    console.error('Refresh token failed: Invalid response');
                    isRefreshing = false;
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                isRefreshing = false;
                return Promise.reject(error);
            }
        }

        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
            return Promise.reject({
                response: {
                    status: 408,
                    data: { message: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง' }
                }
            });
        }

        if (!error.response) {
            console.error('Network error');
            return Promise.reject({
                response: {
                    status: 0,
                    data: { message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต' }
                }
            });
        }

        try {
            if (error.response && typeof error.response.data === 'string') {
                const responseData = error.response.data as string;
                if (responseData.startsWith('{') && responseData.endsWith('}')) {
                    try {
                        error.response.data = JSON.parse(responseData);
                    } catch {
                        error.response.data = {
                            message: responseData.substring(0, 100)
                        };
                    }
                } else {
                    error.response.data = {
                        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์'
                    };
                }
            }
        } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            error.response = {
                ...error.response,
                data: { message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ' }
            };
        }

        return Promise.reject(error);
    }
);