import API_BASE_URL from "@/config/baseURL";
import axios from "axios";

let loggedUserData: any = null;

export const fetchUser = async () => {
  try {
    const token = localStorage.getItem("ffa-admin");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_BASE_URL}/admin`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    loggedUserData = response.data;
    return loggedUserData;
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch user data"
    );
  }
};

export const getLoggedUserData = () => {
  return loggedUserData;
};
