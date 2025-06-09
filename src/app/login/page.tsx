"use client";
import { useAuth } from "@/context/AuthContext";
import { TeamMemberLogin } from "@/types/types";
import React, { FormEvent, useState } from "react";
import Message from "@/components/message";
import { FaArrowAltCircleLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

const LoginForm = () => {
  const { login, loading,error,success } = useAuth();
  const [formData, setFormData] = useState<TeamMemberLogin>({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  

  const handleChangeFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
     
      await login(formData);
    } catch (error) {
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <Link href='/' className="text-blue-600 font-bold underline flex items-center gap-2 " ><FaArrowAltCircleLeft/> Back Home</Link>
        <div className="text-center mb-6">
          <img src="/xcooll.png" alt="Logo" className="w-32 h-32 mx-auto" />
        </div>

        {error && <Message type="error" text={error} />}
        {success && <Message type="success" text={success} />}

        <div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              onChange={handleChangeFormData}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                onChange={handleChangeFormData}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border-2 border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                required
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
          <div className="flex justify-between items-center mb-4">
            <div>
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="mr-2"
              />
              <label htmlFor="remember" className="text-gray-600">
                Remember me
              </label>
            </div>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Forgot password?
            </a>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
