"use client";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import Popup from "@/components/Popup";
import Loader from "@/components/loader";
import {  FaKey, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const TwoFactorAuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [id, setId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [popupMessage, setPopupMessage] = useState('');
  const { fetchLoggedUser } = useAuth();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 4);

    if (numbers.length === 4) {
      setOtp(numbers);
      inputRefs.current[3]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const tokenIndex = pathParts.indexOf("two-factor-auth") + 1;
    const id = pathParts[tokenIndex];
    setId(id || null);
  }, []);

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      const OTP = otp.join('');

      if (OTP.length !== 4) {
        showNotification('error', 'Please enter a valid 4-digit OTP');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/member/two-factor/${id}`,
        { OTP }
      );
      showNotification('success', response.data.message);
      localStorage.setItem("ffa-admin", response.data.token);
      await fetchLoggedUser();
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showNotification('error', error.response.data.message);
      } else {
        showNotification('error', 'Failed! Try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader fullScreen text="Verifying OTP..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 tansition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-6">
                <button
                  onClick={() => window.history.back()}
                  className="mr-4 text-gray-600 hover:text-gray-800"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div className="text-center flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Two-Factor Authentication</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-2 flex items-center justify-center">
                    <FaEnvelope className="mr-2" />
                    Enter the 4-digit code sent to your email
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      id={`otp-${index}`}
                      onPaste={handlePaste}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOTP}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
                  disabled={isLoading || otp.join('').length !== 4}
                >
                  <FaKey className="mr-2" />
                  {isLoading ? "Verifying..." : "Verify"}
                </button>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                  <p>Didn&rsquo;t receive the code?</p>
                  <button
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
                    onClick={() => window.location.reload()}
                  >
                    <FaEnvelope className="mr-2" />
                    Resend Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <Popup
          type={popupType}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default TwoFactorAuthPage;
