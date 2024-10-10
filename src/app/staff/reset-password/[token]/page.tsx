"use client";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsValidPassword(newPassword.length >= 8);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(e.target.value);
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const tokenIndex = pathParts.indexOf("reset-password") + 1;
    const token = pathParts[tokenIndex];
    setToken(token || null);
  }, []);

  const handleChangePassword = async () => {
    if (password === "" || confirmPassword === "") {
      toast.error("Password fields cannot be empty");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isValidPassword) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/member/reset-password/${token}`,
        { password:password }
      );
      toast.success(response.data.message);
      window.location.href = "/admin/login";
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed! Try again");
      }
      // console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen flex-wrap content-center">
      <a href="/" className="p-2 bg-blue-700 fixed top-3 left-4 text-white">
        Back Home
      </a>
      <h2 className="text-center w-full text-blue-500">Reset Password</h2>
      <div className="mx-auto shadow-lg bg-slate-200 px-10 lg:w-1/3 py-20 rounded-md flex flex-col gap-6 items-center">
        <p className={`text-red-600 ${isValidPassword ? "hidden" : "block"}`}>
          Enter a password of at least 8 characters
        </p>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter New Password"
          className={`p-3 w-full border-2 ${
            isValidPassword ? "border-white" : "border-red-600"
          }`}
          onChange={handlePasswordChange}
        />
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          placeholder="Confirm New Password"
          className="p-3 w-full border-2 border-white"
          onChange={handleConfirmPasswordChange}
        />
        <button
          className="bg-blue-600 px-5 py-2 hover:bg-blue-700 text-white"
          onClick={handleChangePassword}
        >
          {isLoading ? "Changing Password..." : "Change Password"}
        </button>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
