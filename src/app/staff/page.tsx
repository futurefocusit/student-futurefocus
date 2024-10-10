// pages/attendance.tsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import Link from "next/link";

interface AttendanceRecord {
  _id: string;
  name: string;
  email: string;
  status: string
  createdAt: string;
}

const AttendancePage: React.FC = () => {
  const { loggedUser, loggedMember, logout } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchAttendance = async () => {
    if (!loggedMember) return;

    try {
      const response = await axios.get<AttendanceRecord[]>(
        `${API_BASE_URL}/member/my-attendance/${loggedMember._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
          },
        }
      );
      const sortedAttendance = response.data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAttendance(sortedAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to load attendance data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [loggedMember]);

  const markAttendance = async (recordId: string) => {
    if (!loggedMember) return;
    try {
      await axios.put(
        `${API_BASE_URL}/member/request-attend/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
          },
        }
      );

      toast.success("Attendance marked successfully!");
      await fetchAttendance();
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance.");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Navbar
        loggedUser={loggedUser}
        loggedMember={loggedMember}
        logout={logout}
      />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
        {attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className="min-w-full mt-4">
            <thead>
              <tr>
                
                <th className="border-b-2 border-gray-300 p-2 text-left">
                  Date
                </th>
                <th className="border-b-2 border-gray-300 p-2 text-left">
                  Status
                </th>
                <th className="border-b-2 border-gray-300 p-2 text-left">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  
                  <td className="border-b border-gray-200 p-2">
                    {new Date(record.createdAt).toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "short", 
                  day: "2-digit" 
                })}
                  </td>
                  <td className="border-b border-gray-200 p-2">
                    {record.status}
                  </td>
                  <td className="border-b border-gray-200 p-2">
                    {record.status === "absent" && (
                      <button
                        onClick={() => markAttendance(record._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Attend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Navbar: React.FC<{
  loggedUser: any;
  loggedMember: any;
  logout: () => void;
}> = ({ loggedUser, loggedMember, logout }) => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          My Atendences
        </Link>
        <div className="flex items-center">
          {loggedUser || loggedMember ? (
            <>
              <span className="mr-4">
                {loggedUser?.name || loggedMember?.name} |{" "}
                {loggedUser?.email || loggedMember?.email}
              </span>
              <button onClick={logout} className="bg-red-500 px-3 py-1 rounded">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-blue-500 px-3 py-1 rounded">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AttendancePage;
