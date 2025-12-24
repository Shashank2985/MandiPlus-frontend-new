"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutApi, setAuthToken } from "@/features/auth/api"; 
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (token: string, userData?: any) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Inside AuthProvider component...

    const login = async (token: string, userData?: any) => {
        // 1. Set Token & Headers immediately
        localStorage.setItem('accessToken', token);
        setAuthToken(token);

        let finalUser = userData;

        // 2. If user data is missing, fetch it from the backend
        if (!finalUser) {
            try {
                console.log("User data missing in login response, fetching profile...");
                finalUser = await getCurrentUser();
            } catch (error) {
                console.error("Failed to fetch user profile on login", error);
            }
        }

        // 3. Update State & Storage
        if (finalUser) {
            localStorage.setItem('user', JSON.stringify(finalUser));
            setUser(finalUser);
            console.log("Login State Updated. User:", finalUser);

            // 4. Redirect to Home
            router.push("/home");
        } else {
            console.error("Login failed: Unable to retrieve user details.");
        }
    };

    const loadUser = async () => {
        try {
            // Check if token exists first to avoid unnecessary API calls
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            // Re-set headers on refresh
            setAuthToken(token);

            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
            }
        } catch (error) {
            console.error("Failed to load user", error);
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            setAuthToken(null); // Clear axios headers
            router.push("/");
        }
    };

    return (
        // 2. Add 'login' to the value object
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};