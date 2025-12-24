"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import { login, verifyLoginOtp } from "@/features/auth/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!showOtpField) {
                // First step: Request OTP
                if (!mobileNumber || mobileNumber.length !== 10) {
                    toast.error("Please enter a valid 10-digit mobile number");
                    return;
                }

                await login(mobileNumber);
                setShowOtpField(true);
                toast.success("OTP sent to your mobile number!");
            } else {
                // Second step: Verify OTP
                if (!otp || otp.length !== 6) {
                    toast.error("Please enter a valid 6-digit OTP");
                    return;
                }

                const response = await verifyLoginOtp({ mobileNumber, otp });

                if (response.accessToken) {
                    toast.success("Login successful!");
                    // The AuthProvider will handle the redirection based on the updated auth state
                    router.push("/home");
                    router.refresh(); // Refresh to ensure auth state is updated
                }
            }
        } catch (error: any) {
            const errorMessage = error?.message || "An error occurred";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gray-300 flex flex-col justify-end`}>
            {/* Bottom Sheet */}
            <div className="bg-white rounded-t-3xl px-6 py-8 shadow-2xl">
                <h2
                    className="text-2xl font-bold mb-1 text-gray-800"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    Welcome to <span className="text-[#4309ac]">MandiPlus</span>
                </h2>

                <p className="text-gray-800 mb-6">
                    Sign in to your account
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!showOtpField ? (
                        <Input
                            className="bg-gray-100/80"
                            placeholder="Mobile Number"
                            maxLength={10}
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                        />
                    ) : (
                        <>
                            <p className="text-center text-sm text-gray-700">
                                Enter OTP sent to {mobileNumber}
                            </p>

                            <Input
                                className="bg-gray-100/80 text-center tracking-widest"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-xl text-white ${isLoading ? "bg-gray-400" : "bg-[#4309ac]"}`}
                    >
                        {isLoading
                            ? "Processing..."
                            : showOtpField ? "Verify OTP" : "Get OTP"}
                    </Button>

                    <div className="text-center text-sm">
                        {showOtpField ? (
                            <button
                                type="button"
                                onClick={() => setShowOtpField(false)}
                                className="text-[#4309ac]"
                            >
                                Back to login
                            </button>
                        ) : (
                            <p className="text-gray-700">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-[#4309ac] font-medium">
                                    Sign up
                                </Link>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;