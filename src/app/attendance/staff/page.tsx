"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/loader";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { hasPermission } from "@/libs/hasPermission";
import { memberAttendanceRecord, TeamMember } from "@/types/types";
import { useAuth } from "@/context/AuthContext";

type GroupedAttendance = {
  [key: string]: memberAttendanceRecord[];
};

const AttendancePage: React.FC = () => {
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [attendance, setAttendance] = useState<memberAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [response, setresponse] = useState<string>("");
  const [nameSearch, setNameSearch] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();

  const fetchAttendance = async () => {
    try {
      await fetchLoggedUser();
      const response = await axios.get<memberAttendanceRecord[]>(
        `${API_BASE_URL}/member/attendance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
          },
        }
      );
      const sortedAttendance = response.data.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setAttendance(sortedAttendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to load attendance data.");
    } finally {
      setIsLoading(false);
    }
  };
const getLocationFromIP = async () => {
  const response = await fetch("https://ipapi.co/json/");
  const data = await response.json();
  setLocation({
    latitude: data.latitude,
    longitude: data.longitude,
  });
};
  const handleResponse = async (id: string,phone:string) => {
    try {
      await axios.put(`${API_BASE_URL}/member/response/${id}`, { response,phone });
      toast.success("comment added");
    } catch (error) {
      toast.error("failed to add comment");
    }
  };

  useEffect(() => {
    fetchAttendance();
    getLocationFromIP()
  }, []);

  const markAttendance = async (recordId: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/member/approve-attend/${recordId}`,
        location,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-team-member")}`,
          },
        }
      );
      toast.success("Attendance marked successfully!");
      await fetchAttendance();
    } catch (error) {
      //@ts-expect-error error
      if (error.response) {
        //@ts-expect-error error
        toast.error(error.response.message);
        //@ts-expect-error error
      } else if (error.request) {
        toast.error("failed to attend. try again");
      } else {
        toast.error("failed to attend. try again");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "text-green-600";
      case "pending":
        return "text-blue-600";
      case "absent":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filterAttendance = () => {
    return attendance.filter((record) => {
      const matchesStatus =
        statusFilter === "all" || record.status.toLowerCase() === statusFilter;
      const recordDate = new Date(record.updatedAt);
      const matchesStartDate = !startDate || recordDate >= new Date(startDate);
      const matchesEndDate = !endDate || recordDate <= new Date(endDate);
      const matchesName =
        !nameSearch ||
        record.memberId.name.toLowerCase().includes(nameSearch.toLowerCase());
      return matchesStatus && matchesStartDate && matchesEndDate && matchesName;
    });
  };

  const groupAttendanceByDate = (
    filteredRecords: memberAttendanceRecord[]
  ): GroupedAttendance => {
    return filteredRecords.reduce((groups: GroupedAttendance, record) => {
      const date = new Date(record.updatedAt).toLocaleDateString("en-US", {
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
      <SideBar />
      {hasPermission(loggedUser as TeamMember, "staff-attendance", "view") ? (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4 text-center">STAFF ATTENDANCE RECORDS</h1>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Search by Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search member name..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="present">Present</option>
                <option value="pending">Pending</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
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
                        #
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        NAME
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        ROLE
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        STATUS
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        TIME IN
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        TIME OUT
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        ACTION
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        STAFF COMMENT
                      </th>
                      <th className="border-b-2 border-gray-300 p-2 text-left">
                        ADMIN COMMENT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record._id}>
                        <td className="border-b border-gray-200 p-2">
                          {index + 1}
                        </td>
                        <td className="border-b border-gray-200 p-2">
                          {record.memberId?.name}
                        </td>
                        <td className="border-b border-gray-200 p-2">
                          {record.memberId?.position}
                        </td>
                        <td
                          className={`border-b border-gray-200 p-2 ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </td>
                        <td className="border-b border-gray-200 p-2">
                          {record.status === "present" ||
                          record.status === "pending"
                            ? new Date(record.updatedAt).toLocaleTimeString()
                            : "---"}
                        </td>
                        <td className="border-b border-gray-200 p-2">
                          {record.timeOut
                            ? new Date(record.timeOut).toLocaleTimeString() ||
                              "--"
                            : "---"}
                        </td>
                        {hasPermission(
                          loggedUser as TeamMember,
                          "staff-attendance",
                          "attend"
                        ) ? (
                          <td className="border-b border-gray-200 p-2">
                            {record.status === "pending" && (
                              <button
                                onClick={() => markAttendance(record._id)}
                                className="bg-blue-500 text-white px-2 py-1 rounded"
                              >
                                Attend
                              </button>
                            )}
                          </td>
                        ) : (
                          ""
                        )}
                        <td>
                          <p className="text-green-700 font-bold">
                            {record.comment}
                          </p>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={record.response}
                            placeholder="Response"
                            onChange={(e) => setresponse(e.target.value)}
                            className="text-black px-2 py-1 rounded"
                          />
                          <button
                            onClick={() => handleResponse(record._id,record.memberId.phone)}
                            className="bg-blue-500 text-white px-2 py-1 mx-10 rounded"
                          >
                            +
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center">
          you dont&apos;t have permission to view this
        </div>
      )}
    </div>
  );
};

export default withAdminAuth(AttendancePage);
