"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/loader";
import API_BASE_URL from "@/config/baseURL";
import { toast } from "react-toastify";
import withMemberAuth from "@/components/withMemberAuth";
import { isToday } from "@/libs/formatDate";
import SideBar from "@/components/SideBar";

interface ICharge {
  type: string
  amount: number
  status: string
}
interface AttendanceRecord {
  _id: string;
  name: string;
  email: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  timeOut: string;
  comment: string
  response: string
  charge: ICharge

}


type GroupedAttendance = {
  [key: string]: AttendanceRecord[];
};
const AttendancePage: React.FC = () => {
  const [location, setLocation] = useState({ latitude: "", longitude: "" })
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [comment, setcomment] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();


  const fetchAttendance = async () => {


    try {
      await fetchLoggedUser()
      if (!loggedUser) return
      const response = await axios.get<AttendanceRecord[]>(
        `${API_BASE_URL}/member/my-attendance/${loggedUser._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
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
  const handleComment = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/member/comment/${id}`,
        { comment }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      }
      )
      toast.success('response added')
    } catch (error) {
      toast.error("failed to add response");

    }
  }
  const getLocationFromIP = async () => {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    setLocation({
      latitude: data.latitude,
      longitude: data.longitude
    })

  };

  useEffect(() => {
    fetchAttendance();
    getLocationFromIP()
  }, []);


  const markAttendance = async (recordId: string) => {
    if (!loggedUser) return;
    try {
      await axios.put(
        `${API_BASE_URL}/member/request-attend/${recordId}`,
        location,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        }
      );
      toast.success("Attendance marked successfully!");
      await fetchAttendance();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.message);
      } else if (error.request) {
        toast.error("failed to attend. try again");
      } else {
        toast.error("failed to attend. try again");
      }
    }
  };
  const handleLeave = async (recordId: string) => {
    if (!loggedUser) return;
    try {
      await axios.put(`${API_BASE_URL}/member/leave/${recordId}`, location, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      toast.success("thank you for coming");
      await fetchAttendance();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.message);
      } else if (error.request) {
        toast.error("failed to leave. try again");
      } else {
        toast.error("failed to leave. try again");
      }
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
    <div className="min-h-screen md:mx-auto md:max-w-5xl bg-gray-50">
      <SideBar />
      <div className="container mx-auto  sm:px-4 py-4 md:py-6 lg:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 ml-20">MY ATTENDANCE RECORDS</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:flex-1">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="w-full sm:flex-1">
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:flex-1">
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {Object.keys(groupedAttendance).length === 0 ? (
          <p className="text-center text-gray-600 py-4">No attendance records found.</p>
        ) : (
          Object.entries(groupedAttendance).map(([date, records]) => (
            <div key={date} className="mb-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold p-4 bg-gray-50 border-b">{date}</h2>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          TIME IN
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          TIME OUT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          STATUS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          ACTION
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          YOUR COMMENT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          ADMIN COMMENT
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          CHARGE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {record.status === "present" || record.status === "pending"
                              ? new Date(record.updatedAt).toLocaleTimeString()
                              : "----"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {record.timeOut
                              ? new Date(record.timeOut).toLocaleTimeString()
                              : "---"}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm ${getStatusColor(record.status)}`}>
                            {record.status}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {record.status === "absent" && isToday(record.createdAt) && (
                              <button
                                onClick={() => markAttendance(record._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Attend
                              </button>
                            )}
                            {isToday(record.createdAt) && !record.timeOut && record.status === "present" && (
                              <button
                                onClick={() => handleLeave(record._id)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Leave
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <input
                                type="text"
                                value={record.comment}
                                placeholder="Add comment"
                                onChange={(e) => setcomment(e.target.value)}
                                className="flex-1 text-sm px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleComment(record._id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors whitespace-nowrap"
                              >
                                Add
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <p className="text-green-600 font-medium">
                              {record.response || "-"}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {record?.charge?.amount ? (
                              <p className={`${record?.charge?.amount >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                                {record?.charge?.amount} frw
                              </p>
                            ) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


export default withMemberAuth(AttendancePage);
