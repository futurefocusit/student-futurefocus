"use client";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Message from "@/components/message";

const ResetPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const validatePassword = (value: string) => {
    setHasMinLength(value.length >= 8);
    setHasUpperCase(/[A-Z]/.test(value));
    setHasLowerCase(/[a-z]/.test(value));
    setHasNumber(/\d/.test(value));
    setHasSpecialChar(/[@$!%*?&]/.test(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setPasswordsMatch(newPassword === confirmPassword);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordsMatch(password === newConfirmPassword);
  };

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const tokenIndex = pathParts.indexOf("reset-password") + 1;
    const token = pathParts[tokenIndex];
    setToken(token || null);
  }, []);

  const handleChangePassword = async () => {
    if (password === "" || confirmPassword === "") {
      setError("Password fields cannot be empty");
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError("Password does not meet all requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const response = await axios.put(
        `${API_BASE_URL}/member/reset-password/${token}`,
        { password }
      );
      setSuccess(response.data.message);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message);
      } else {
        setError("Failed! Try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        {error && <Message type="error" text={error} />}
        {success && <Message type="success" text={success} />}

        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${passwordsMatch && confirmPassword ? "focus:ring-green-600" : "focus:ring-red-600"
                  } pr-10`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
            <ul className="space-y-1 text-sm">
              <li className={`flex items-center ${hasMinLength ? "text-green-600" : "text-gray-500"}`}>
                <span className="mr-2">•</span>
                At least 8 characters
              </li>
              <li className={`flex items-center ${hasUpperCase ? "text-green-600" : "text-gray-500"}`}>
                <span className="mr-2">•</span>
                One uppercase letter
              </li>
              <li className={`flex items-center ${hasLowerCase ? "text-green-600" : "text-gray-500"}`}>
                <span className="mr-2">•</span>
                One lowercase letter
              </li>
              <li className={`flex items-center ${hasNumber ? "text-green-600" : "text-gray-500"}`}>
                <span className="mr-2">•</span>
                One number
              </li>
              <li className={`flex items-center ${hasSpecialChar ? "text-green-600" : "text-gray-500"}`}>
                <span className="mr-2">•</span>
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !passwordsMatch || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar}
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
