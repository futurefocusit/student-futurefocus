"use client";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const OTPPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [OTP, setOTP] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const OTP = e.target.value ;
    setOTP(OTP);
  };


  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const tokenIndex = pathParts.indexOf("two-factor-auth") + 1;
    const token = pathParts[tokenIndex];
    setToken(token || null);
  }, []);
  
  const handleVerifyOTP= async()=>{
      try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/admin/two-factor/${token}`,
        { OTP}
      );
      toast.success(response.data.message);
     localStorage.setItem("ffa-admin", response.data.token);
      window.location.href = "/";
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed! Try again");
      }
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
}
  

  return (
    <main className="flex h-screen flex-wrap content-center">
      <a href="/" className="p-2 bg-blue-700 fixed top-3 left-4 rounded text-white">
        Back Home
      </a>
      <h2 className="text-center w-full text-blue-500">verify OTP</h2>
      <div className="mx-auto shadow-lg bg-slate-200 px-10 lg:w-1/3 py-20 rounded-md flex flex-col gap-6 items-center">
    
        <input
          type="number"
          name="OTP"
          id="otp"
          placeholder="Enter New Password"
          className={`p-3 w-full border-2 border-white`}
          onChange={handleOTPChange}
        />
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

export default OTPPage;
