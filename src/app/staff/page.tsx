"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import Link from "next/link";
import withMemberAuth from "@/components/withMemberAuth";
import { isToday } from "@/libs/formatDate";

interface AttendanceRecord {
  _id: string;
  name: string;
  email: string;
  status: string;
  updatedAt: string;
  createdAt:string
  timeOut:string
}

type GroupedAttendance = {
  [key: string]: AttendanceRecord[];
};

const AttendancePage: React.FC = () => {
  const {  loggedMember, logout } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
      await axios.put(`${API_BASE_URL}/member/request-attend/${recordId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
        },
      });
      toast.success("Attendance marked successfully!");
      await fetchAttendance();
    } catch (error) {
      toast.error("Failed to mark attendance.");
    }
  };
  const handleLeave = async (recordId: string) => {
    if (!loggedMember) return;
    try {
      await axios.put(`${API_BASE_URL}/member/leave/${recordId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
        },
      });
      toast.success('thank you for coming');
      await fetchAttendance();
    } catch (error) {
 
      toast.error("Failed to leave. try again");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "text-green-600";
      case "absent":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const filterAttendance = () => {
    return attendance.filter((record) => {
      const matchesStatus =
        statusFilter === "all" ||
        record.status.toLowerCase() === statusFilter.toLowerCase();
      const recordDate = new Date(record.createdAt);
      const matchesStartDate = !startDate || recordDate >= new Date(startDate);
      const matchesEndDate = !endDate || recordDate <= new Date(endDate);
      return matchesStatus && matchesStartDate && matchesEndDate;
    });
  };

  const groupAttendanceByDate = (
    filteredRecords: AttendanceRecord[]
  ): GroupedAttendance => {
    return filteredRecords.reduce((groups: GroupedAttendance, record) => {
      const date = new Date(record.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    }, {});
  };

  if (isLoading) return <Loader />;
  if (error) return <div>{error}</div>;

  const filteredAttendance = filterAttendance();
  const groupedAttendance = groupAttendanceByDate(filteredAttendance);

  return (
    <div>
      <Navbar loggedMember={loggedMember} logout={logout} />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {Object.keys(groupedAttendance).length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          Object.entries(groupedAttendance).map(([date, records]) => (
            <div key={date} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{date}</h2>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="border-b-2 border-gray-300 p-2 text-left">
                      Time In
                    </th>
                    <th className="border-b-2 border-gray-300 p-2 text-left">
                      Time Out
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
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td className="border-b border-gray-200 p-2">
                        {record.status === "present" ||
                          record.status === "pending"?new Date(record.updatedAt).toLocaleTimeString():'----'}
                      </td>
                      <td className="border-b border-gray-200 p-2">
                        { record.timeOut? new Date(record.timeOut).toLocaleTimeString():'---'}
                      </td>
                      <td
                        className={`border-b border-gray-200 p-2 ${getStatusColor(
                          record.status
                        )}`}
                      >
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
                        {isToday(record.createdAt)&&!record.timeOut && record.status === "present" && (
                          <button
                            onClick={() => handleLeave(record._id)}
                            className="bg-orange-500 hover:bg-orange-700 cursor-pointer text-white px-2 py-1 rounded"
                          >
                            Leave
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Navbar: React.FC<{
  //@ts-expect-error errro
  loggedMember;
  logout: () => void;
}> = ({ loggedMember, logout }) => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          My Attendances
        </Link>
        <div className="flex items-center">
          {loggedMember ? (
            <>
              <span className="mr-4">
                {loggedMember?.name} | {loggedMember?.email}
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

export default withMemberAuth(AttendancePage);
