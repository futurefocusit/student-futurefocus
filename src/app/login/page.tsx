"use client";
import {  useAuth } from "@/context/AuthContext";
import { TeamMember, TeamMemberLogin } from "@/types/types";
import React, { FormEvent, useState } from "react";

const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<TeamMemberLogin>({
    email: "",
    password: ""
  });

  const handleChangeFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mx-auto" />
        </div>

        <form onSubmit={handleSubmit}>
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
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <input
              onChange={handleChangeFormData}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
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
              href="https://futurefocus.co.rw/admin/forgot-password"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <a  href="/staff/login" className="mx-auto text-center text-blue-600">login as Staff</a>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
