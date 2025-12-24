import axios, { AxiosError } from "axios";
import { setCookie, deleteCookie } from 'cookies-next';

/**
 * Backend base URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface AuthResponse {
    accessToken?: string;
    refreshToken?: string;
    user?: {
        id: string;
        mobileNumber: string;
        name: string;
        email?: string;
        role: string;
    };
    message?: string;
}

export interface RegisterPayload {
    name: string;
    mobileNumber: string;
    state: string;
}

export interface LoginPayload {
    mobileNumber: string;
}

export interface VerifyOtpPayload {
    mobileNumber: string;
    otp: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

// Set auth token in axios headers
export const setAuthToken = (token: string | null): void => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Store token in localStorage for persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    } else {
        delete axios.defaults.headers.common["Authorization"];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
        }
    }
};

/* -------------------------------------------------------------------------- */
/*                                   Auth APIs                                */
/* -------------------------------------------------------------------------- */

/**
 * Register a new user
 */
export const register = async (data: RegisterPayload): Promise<{ message: string }> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
        return response.data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        throw new Error(err.response?.data?.message || 'Registration failed');
    }
};

/**
 * Verify OTP for registration
 */
export const verifyRegisterOtp = async (data: VerifyOtpPayload): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register/verify-otp`, data);

        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        throw new Error(err.response?.data?.message || 'OTP verification failed');
    }
};

/**
 * Login with mobile number
 */
export const login = async (mobileNumber: string): Promise<{ message: string }> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { mobileNumber });
        return response.data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        throw new Error(err.response?.data?.message || 'Login failed');
    }
};

/**
 * Verify OTP for login
 */
export const verifyLoginOtp = async (data: VerifyOtpPayload): Promise<AuthResponse> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login/verify-otp`, data);

        // Set the access token and refresh token
        if (response.data.accessToken) {
            setAuthToken(response.data.accessToken);

            // Store user data in localStorage
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            // Set refresh token as httpOnly cookie (handled by the backend)
            if (response.data.refreshToken) {
                setCookie('refreshToken', response.data.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                    path: '/',
                });
            }
        }

        return response.data;
    } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        throw new Error(err.response?.data?.message || 'OTP verification failed');
    }
};

/**
 * Get current user by decoding the JWT token to get the user's UUID
 * and then fetching the user details using the /users/{uuid} endpoint
 */
export const getCurrentUser = async (): Promise<AuthResponse['user'] | null> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return null;

        // Get user data from localStorage first (set during login/registration)
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.id) {
                const response = await axios.get(`${API_BASE_URL}/users/${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return response.data;
            }
        }

        // Fallback to decoding token if user data not in localStorage
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            console.error('Invalid token format');
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const userId = payload.sub || payload.userId || payload.id;

        if (!userId) {
            console.error('No user ID found in token');
            return null;
        }

        const response = await axios.get(`${API_BASE_URL}/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    try {
        // Clear tokens
        setAuthToken(null);
        deleteCookie('refreshToken');

        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
        }
    } catch (error) {
        console.error('Logout error:', error);
        throw new Error('Failed to logout');
    }
};
