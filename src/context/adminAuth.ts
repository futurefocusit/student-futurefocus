import API_BASE_URL from "@/config/baseURL";
import { IUser } from "@/types/types";
import axios from "axios";

let loggedUserData:IUser ;

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
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error(
      //@ts-expect-error ignore
      error.response?.data?.message || "Failed to fetch user data"
    );
  }
};

export const getLoggedUserData = () => {
  return loggedUserData;
};
