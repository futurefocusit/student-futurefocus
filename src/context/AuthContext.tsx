"use client";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "@/config/baseURL";
import Loader from "@/components/loader";
import { TeamMember, TeamMemberLogin } from "@/types/types";
interface AuthContextData {
  signed: boolean;
  isLoading: boolean;
  loggedUser: TeamMember | null;
  login: (user: TeamMemberLogin) => Promise<void>;
  fetchLoggedUser: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);


  const fetchLoggedUser = useCallback(async () => {
    const token = localStorage.getItem("ffa-admin");
    if (!token) {
   window.location.href='/login'
    };

    try {
      const response = await axios.get(`${API_BASE_URL}/member/logged-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoggedUser(response.data);
    } catch (error) {
      handleAxiosError(error);
      localStorage.removeItem("ffa-admin");
      setLoggedUser(null);
    }
  }, []);


  const login = useCallback(async (memberData: TeamMemberLogin) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/member/login`,
        memberData,
        { withCredentials: true }
      );
      setLoggedUser(response.data);
      toast.success("Login successful!");
      if(!response.data.token){
        window.location.href = `/two-factor-auth/${response.data.id}`;
      }
      localStorage.setItem("ffa-admin", response.data.token);
      // window.location.href = "/staff";
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoggedUser(null);
      setLoggedUser(null);
      localStorage.removeItem("ffa-admin");
      localStorage.removeItem("ffa-member");
      // window.location.href = "/login";
    } catch (error) {
      handleAxiosError(error);
    }
  }, []);

  const handleAxiosError = (error: unknown) => {
    console.error("API Error:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage = error.response.data.message || "An error occurred";
        toast.error(errorMessage);

        // Handle 401 Unauthorized errors
        if (error.response.status === 401) {
          logout();
        }
      } else if (error.request) {
        toast.error("Failed to connect to server");
      } else {
        toast.error("Error sending request. Please try again.");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  };



  const contextValue = {
    signed: Boolean(loggedUser),
    isLoading,
    loggedUser,
    login,
    logout,
    fetchLoggedUser
  };

  if (isLoading) {
    return <Loader />;
  }

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
