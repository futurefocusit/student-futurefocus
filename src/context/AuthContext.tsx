'use client'
import axios from "axios";
import { createContext, ReactNode, useContext, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "@/config/baseURL";

export interface Admin {
  email: string;
  password: string;
  isSuperAdmin: boolean;
}


interface AuthContextData {
  signed: boolean;
  isLoading: boolean;
  loggedUser: Admin | null;
  login: (user: Admin) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

const AuthContextAPI: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (userData: Admin) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/login`,
        userData,
        { withCredentials: true }
      );
      setLoggedUser(response.data);
      toast.success("Login successful");
      localStorage.setItem("ffa-admin", response.data.token);
      window.location.href = "/";
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // await axios.post(
      //   `${API_BASE_URL}/admin/logout`,
      //   {},
      //   { withCredentials: true }
      // );
      setLoggedUser(null);
      localStorage.removeItem("ffa-admin");
      window.location.href = "/login";
    } catch (error) {
      handleAxiosError(error);
    }
  };

  //@ts-expect-error ignore error
  const handleAxiosError = (error) => {
    console.log("Handling error", error); // Debugging line
    if (axios.isAxiosError(error)) {
      if (error.response) {
        toast.error(error.response.data.message || "An error occurred");
      } else if (error.request) {
        toast.error("Failed to connect to server");
      } else {
        toast.error("Error sending request. Try again.");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: Boolean(loggedUser),
        isLoading,
        loggedUser,
        login,
        logout,
      }}
    >
      {children}
      <ToastContainer />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContextAPI;
