"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/shared/components/Button";
import Input from "@/shared/components/Input";
import Select from "@/shared/components/Select";
import { sendOtp, verifyOtpAndRegister } from "@/features/auth/api";
import { toast } from "react-toastify";

interface FormData {
  mobileNumber: string;
  category: string;
  state: string;
  otp: string;
}

const indianStates = [
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "West Bengal", label: "West Bengal" },
];

const userCategories = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "transporter", label: "Transporter" },
];

const RegisterPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    mobileNumber: "",
    category: "",
    state: "",
    otp: "",
  });

  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [otpResendTime, setOtpResendTime] = useState(0);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (otpResendTime <= 0) return;
    const timer = setTimeout(() => setOtpResendTime((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpResendTime]);

  const handleSendOtp = async () => {
    if (formData.mobileNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setSendingOtp(true);
    setError("");

    try {
      await sendOtp(formData.mobileNumber);
      setOtpSent(true);
      setOtpResendTime(30);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpDigitChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    const otpValue = newDigits.join("");
    setFormData((prev) => ({ ...prev, otp: otpValue }));
    setOtpVerified(otpValue.length === 6);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpVerified || !formData.category || !formData.state) {
      setError("Please fill all fields correctly");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtpAndRegister(formData);
      toast.success("Registration successful!");
      router.push("/home");
    } catch (err: any) {
      setError(err.message || "Verification failed");
      setOtpDigits(Array(6).fill(""));
      setFormData((prev) => ({ ...prev, otp: "" }));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendTime > 0) return;
    await handleSendOtp();
  };

  return (
    <div className={`min-h-screen bg-gray-300 flex flex-col justify-end transition-all duration-300 ${otpSent ? 'transform -translate-y-40' : ''}`}>
      {/* Bottom Sheet */}
      <div className={`bg-white rounded-t-3xl px-6 py-8 shadow-2xl transition-all duration-300 ${otpSent ? 'transform -translate-y-40' : ''}`}>
        <h2
          className="text-2xl font-bold mb-1 text-gray-800"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Welcome to <span className="text-[#4309ac]">MandiPlus</span>
        </h2>
        <p className="text-gray-800 mb-6">Login or Register</p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <Input
              className="bg-gray-100/80 pl-12"
              name="mobileNumber"
              placeholder="Enter Mobile Number"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              maxLength={10}
            />
          </div>

          <div className="flex flex-col gap-2 justify-center px-6">
            {userCategories.map((category) => (
              <label
                key={category.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleInputChange}
                  className="accent-[#4309ac]"
                />
                <span className="text-gray-800">{category.label}</span>
              </label>
            ))}
          </div>

          <Select
            className="bg-gray-200/80"
            name="state"
            placeholder="Select State"
            options={indianStates}
            value={formData.state}
            onChange={handleInputChange}
          />

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className={`w-full py-2 text-white rounded-4xl ${sendingOtp ? 'bg-gray-400' : 'bg-[#4309ac]'}`}
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          ) : (
            <div className="text-center text-sm text-gray-500">
              OTP has been sent to {formData.mobileNumber}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          By continuing, I agree to Terms of Use & Privacy Policy
        </p>
      </div>

      {/* OTP Modal */}
      {otpSent && (
        <div className="fixed inset-0 bg-white z-40 flex items-end animate-slide-up">
          <div className="w-full bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <button
                className="text-slate-800 text-2xl"
                onClick={() => setOtpSent(false)}
              >
                ←
              </button>
              <h2 className="text-2xl font-semibold text-slate-800">Verify your OTP</h2>
              <div className="w-6"></div> {/* Spacer for alignment */}
            </div>

            <p className="text-slate-800 mb-6 text-center">
              Enter OTP sent to {formData.mobileNumber}
            </p>

            {/* OTP Boxes */}
            <div className="flex justify-between gap-2 mb-6">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpDigitChange(e.target.value, index)
                  }
                  onKeyDown={(e) => handleOtpKeyDown(e, index)}
                  className="text-slate-800 w-10 h-10 text-center text-xl font-semibold border border-gray-400 rounded-lg focus:outline-none focus:border-[#4309ac]"
                />
              ))}
            </div>

            <p className="text-sm text-slate-800 mb-6 text-center">
              {otpResendTime > 0 ? (
                `Resend OTP in ${otpResendTime}s`
              ) : (
                <>
                  Didn't receive OTP?{" "}
                  <button
                    onClick={handleResendOtp}
                    disabled={otpResendTime > 0}
                    className="text-[#4309ac] disabled:text-slate-800"
                  >
                    Send again
                  </button>
                </>
              )}
            </p>

            <div className="mt-6">
              <Button
                onClick={handleVerifyOtp}
                disabled={!otpVerified || loading}
                className={`w-full py-3 rounded-xl ${!otpVerified || loading ? 'bg-gray-400' : 'bg-[#4309ac]'}`}
              >
                {loading ? "Verifying..." : "Verify and Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
