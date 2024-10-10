"use client";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API_BASE_URL from "@/config/baseURL";
import Loader from "@/components/loader";

export interface Admin {
  email: string;
  name: string;
  password: string;
  isSuperAdmin: boolean;
}

export interface TeamMember {
  _id: string; // Assuming there's an ID for the team member
  email: string;
  name: string;
  password:string
}

interface AuthContextData {
  signed: boolean;
  isLoading: boolean;
  loggedUser: Admin |null;
  loggedMember:  TeamMember | null;
  login: (user: Admin) => Promise<void>;
  loginTeamMember: (member: TeamMember) => Promise<void>;
  fetchLoggedTeamMember: () => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

const AuthContextAPI: React.FC<AuthProviderProps> = ({ children }) => {
  const [loggedMember, setLoggedMember] = useState< TeamMember | null>(null);
  const [loggedUser, setLoggedUser] = useState<Admin |null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logged team member details
  const fetchLoggedTeamMember = async () => {
    const token = localStorage.getItem("ffa-team-member");
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/member/logged-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoggedMember(response.data);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: Admin) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/login`,
        userData,
        { withCredentials: true }
      );
      setLoggedUser(response.data);
      toast.success("Check email for OTP");
      localStorage.setItem("ffa-admin", response.data.token);
      window.location.href = `/two-factor-auth/${response.data.id}`;
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loginTeamMember = async (memberData: TeamMember) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/member/login`,
        memberData,
        { withCredentials: true }
      );
      setLoggedUser(response.data);
      toast.success("Login successful!");
      localStorage.setItem("ffa-team-member", response.data.token);
    } catch (error) {
      handleAxiosError(error);

    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoggedUser(null);
      localStorage.removeItem("ffa-admin");
      localStorage.removeItem("ffa-team-member");
      window.location.href = "/login";
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleAxiosError = (error: unknown) => {
    console.log("Handling error", error);
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

  useEffect(() => {
    fetchLoggedTeamMember();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        signed: Boolean(loggedUser),
        isLoading,
        loggedUser,
        loggedMember,
        login,
        loginTeamMember,
        fetchLoggedTeamMember,
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
