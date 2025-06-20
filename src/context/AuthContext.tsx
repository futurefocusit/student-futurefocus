"use client";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "@/config/baseURL";
import { TeamMember, TeamMemberLogin } from "@/types/types";
import axiosInstance, { fetchWithCache, fetchWithRetry } from '@/libs/axios';

interface AuthContextData {
  error: string
  success: string
  signed: boolean;
  loading: boolean;
  loggedUser: TeamMember | null;
  login: (user: TeamMemberLogin) => Promise<void>;
  fetchLoggedUser: () => Promise<void>;
  fetchTeam: () => Promise<TeamMember[]>;
  addTeamMember: (newMember: Omit<TeamMember, "_id">) => Promise<void>;
  updateTeamMember: (id: string, updatedMember: TeamMember) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

const AuthContextAPI: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedUser, setLoggedUser] = useState<TeamMember | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLoggedUser = useCallback(async () => {
    const token = localStorage.getItem("ffa-admin");
    if (!token) {
      setLoggedUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetchWithRetry(() =>
        axiosInstance.get(`${API_BASE_URL}/member/logged-user`)
      );
      setLoggedUser(response.data);
    } catch (error) {
      // Let the axios interceptor handle 401 errors
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status !== 401) {
          const errorMessage = error.response.data.message || "An error occurred";
          toast.error(errorMessage);
        } else if (error.request) {
          toast.error("Network error! Please check your connection.");
        } else {
          toast.error("Error sending request. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      setLoggedUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoggedUser();
  }, []); // Remove fetchLoggedUser from dependencies to prevent infinite loop

  const login = useCallback(async (memberData: TeamMemberLogin) => {
    setIsLoading(true);
    try {
      setError("");
      setSuccess("");
      const response = await fetchWithRetry(() =>
        axiosInstance.post(`${API_BASE_URL}/member/login`, memberData, { withCredentials: true })
      );
      setSuccess("Login successful!");
      setLoggedUser(response.data);
      toast.success("Login successful!");

      if (!response.data.token) {
        window.location.href = `/two-factor-auth/${response.data.id}`;
        return
      }
      localStorage.setItem("ffa-admin", response.data.token);
      window.location.href = "/staff";
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchTeam = async (): Promise<TeamMember[]> => {
    setIsLoading(true);
    try {
      const response = await fetchWithCache<TeamMember[]>(`${API_BASE_URL}/member`);
      return response;
    } catch (error) {
      handleAxiosError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMember = async (newMember: Omit<TeamMember, "_id">) => {
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(() =>
        axiosInstance.post(`${API_BASE_URL}/member/new`, newMember, { withCredentials: true })
      );
      toast.success("Member added successfully");
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeamMember = async (id: string, updatedMember: TeamMember) => {
    setIsLoading(true);
    try {
      await fetchWithRetry(() =>
        axiosInstance.put(`${API_BASE_URL}/member/update/${id}`, updatedMember, { withCredentials: true })
      );
      toast.success("Member updated successfully");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeamMember = async (id: string) => {
    setIsLoading(true);
    try {
      await fetchWithRetry(() =>
        axiosInstance.delete(`${API_BASE_URL}/member/delete/${id}`, { withCredentials: true })
      );
      toast.success("Member deleted successfully");
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoggedUser(null);
      setLoggedUser(null);
      localStorage.removeItem("ffa-admin");
      window.location.href = "/login";
    } catch (error) {
      handleAxiosError(error);
    }
  }, []);

  const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage = error.response.data.message || "An error occurred";
        setError(errorMessage);


        if (error.response.status === 401) {
          logout();
        }
      } else if (error.request) {
        toast.error("network error ");
      } else {

        toast.error("Error sending request. Please try again.");
      }
    } else {
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred");
    }
  };

  const contextValue = {
    signed: Boolean(loggedUser),
    loading,
    loggedUser,
    error,
    success,
    login,
    logout,
    fetchLoggedUser,
    fetchTeam,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  };



  return (
    <AuthContext.Provider value={contextValue}>
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

