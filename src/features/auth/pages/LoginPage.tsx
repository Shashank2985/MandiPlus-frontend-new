"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
// Renaming 'login' to 'apiLogin' to distinguish from Context login
import { login as apiLogin, verifyLoginOtp } from "@/features/auth/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

import Image from "next/image";

const LoginPage = () => {
    const router = useRouter();
    const { login: contextLogin } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpField, setShowOtpField] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!showOtpField) {
                // --- Step 1: Send OTP ---
                if (!mobileNumber || mobileNumber.length !== 10) {
                    toast.error("Please enter a valid 10-digit mobile number");
                    return;
                }

                await apiLogin(mobileNumber);
                setShowOtpField(true);
                toast.success("OTP sent to your mobile number!");
            } else {
                // --- Step 2: Verify OTP ---
                if (!otp || otp.length !== 6) {
                    toast.error("Please enter a valid 6-digit OTP");
                    return;
                }

                const response = await verifyLoginOtp({ mobileNumber, otp });

                // Use 'accessToken' or 'token' depending on what the console log says
                const token = response.accessToken;

                if (token) {
                    if (contextLogin) {
                        await contextLogin(token, response.user);
                    }
                    toast.success("Login successful!");
                } else {
                    toast.error("Login failed: No access token received");
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
        <div className="min-h-screen bg-gray-300 flex flex-col relative overflow-hidden">

            {/* IMAGE SECTION:
               - w-full h-auto: Allows image to scale naturally without cropping.
               - pb-8: Adds padding at the bottom for the white card to overlap into.
            */}
            <div className="w-full relative bg-gray-200 pb-8">
                <Image
                    src="/images/truck-img.png" // Make sure this matches your file name/extension
                    alt="Truck on the road"
                    width={1200}
                    height={800}
                    className="w-full h-auto block"
                    priority
                />
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/5 to-transparent" />
            </div>

            {/* FORM SECTION:
               - -mt-8: Pulls the card up to overlap the padding area of the image container.
               - rounded-t-[30px]: consistent styling with Register page.
            */}
            <div className="flex-1 bg-white -mt-8 px-6 py-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10 flex flex-col">
                <h2
                    className="text-2xl font-bold mb-1 text-gray-800"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    Welcome to <span className="text-[#4309ac]">MandiPlus</span>
                </h2>

                <p className="text-gray-800 mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
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

                    <div className="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 rounded-xl text-white ${isLoading ? "bg-gray-400" : "bg-[#4309ac]"
                                }`}
                        >
                            {isLoading
                                ? "Processing..."
                                : showOtpField
                                    ? "Verify OTP"
                                    : "Get OTP"}
                        </Button>
                    </div>

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