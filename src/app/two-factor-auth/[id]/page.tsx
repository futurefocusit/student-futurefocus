"use client";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']); // 4 separate boxes for OTP
  const [id, setId] = useState<string | null>(null);
 const {fetchLoggedUser} = useAuth()
  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Allow only numbers
    const newOtp = [...otp];
    newOtp[index] = value;

    // Move to the next input if the current one is filled
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    setOtp(newOtp);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus(); // Move to the previous input on backspace
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
      const response = await axios.post(
        `${API_BASE_URL}/member/two-factor/${id}`,
        { OTP }
      );
      toast.success(response.data.message);
      localStorage.setItem("ffa-admin", response.data.token);
      await fetchLoggedUser()
      window.location.href = "/dashboard";
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed! Try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen flex-wrap content-center">
      <a href="/" className="p-2 bg-blue-700 fixed rounded top-3 left-4 text-white">
        Back Home
      </a>
      <h2 className="text-center w-full text-blue-500">2 Factor Authentication</h2>
      <div className="mx-auto shadow-lg bg-slate-200 px-10 lg:w-1/3 py-20 rounded-md flex flex-col gap-6 items-center">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              id={`otp-${index}`}
              className="p-3 w-10 text-center border-2 border-white"
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
        </div>
        <button
          className="bg-blue-600 px-5 py-2 hover:bg-blue-700 text-white"
          onClick={handleVerifyOTP}
        >
          {isLoading ? "verifying" : "verify"}
        </button>
      </div>
    </main>
  );
};

export default ResetPasswordPage
