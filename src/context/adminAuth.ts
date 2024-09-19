import API_BASE_URL from "@/config/baseURL";
import axios from "axios";

export const fetchUser = async () => {
  try {
    const token = localStorage.getItem("ffa-admin");

    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get(`${API_BASE_URL}/admin`, {
      // withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);

    throw new Error(
      //@ts-expect-error ignore error
      error.response?.data?.message || "Failed to fetch user data"
    );
  }
};
