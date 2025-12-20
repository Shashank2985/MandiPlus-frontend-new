import axios, { AxiosError } from "axios";

/**
 * Backend base URL
 * In Next.js, always read from env
 */
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface SendOtpResponse {
    success: boolean;
    message: string;
}

export interface VerifyOtpPayload {
    mobileNumber: string;
    otp: string;
    category?: string;
    state?: string;
}

export interface AuthResponse {
    token?: string;
    user?: {
        _id: string;
        mobileNumber: string;
        category: string;
        state: string;
    };
    message?: string;
}

export interface ApiError {
    message: string;
}

/* -------------------------------------------------------------------------- */
/*                               Helper Methods                               */
/* -------------------------------------------------------------------------- */

// Set auth token in axios headers
export const setAuthToken = (token: string | null): void => {
    if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common["Authorization"];
    }
};

/* -------------------------------------------------------------------------- */
/*                                   APIs                                     */
/* -------------------------------------------------------------------------- */

// Send OTP to mobile number
export const sendOtp = async (
    mobileNumber: string
): Promise<SendOtpResponse> => {
    try {
        const response = await axios.post<SendOtpResponse>(
            `${API_BASE_URL}/auth/send-otp`,
            { mobileNumber }
        );
        return response.data;
    } catch (error) {
        const err = error as AxiosError<ApiError>;
        throw err.response?.data || { message: "Failed to send OTP" };
    }
};

// Verify OTP and complete registration
export const verifyOtpAndRegister = async (
    data: VerifyOtpPayload
): Promise<AuthResponse> => {
    try {
        // Clean mobile number (remove non-digits and leading 91)
        const cleanMobileNumber = data.mobileNumber
            .replace(/\D/g, "")
            .replace(/^91/, "");

        const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/auth/verify-otp`,
            {
                ...data,
                mobileNumber: cleanMobileNumber,
            }
        );

        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            setAuthToken(response.data.token);
        }

        return response.data;
    } catch (error) {
        const err = error as AxiosError<ApiError>;
        throw err.response?.data || { message: "OTP verification failed" };
    }
};

// Get current logged-in user
export const getCurrentUser = async (): Promise<AuthResponse["user"] | null> => {
    try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        setAuthToken(token);

        const response = await axios.get<AuthResponse["user"]>(
            `${API_BASE_URL}/auth/me`
        );
        return response.data;
    } catch {
        localStorage.removeItem("token");
        setAuthToken(null);
        return null;
    }
};

// Register user (non-OTP flow, if used)
export const registerUser = async (
    data: Record<string, unknown>
): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>(
            `${API_BASE_URL}/auth/register`,
            data
        );
        return response.data;
    } catch (error) {
        const err = error as AxiosError<ApiError>;
        throw err.response?.data || { message: "Registration failed" };
    }
};
