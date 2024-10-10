"use client";
import Loader from "@/components/loader";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import { changeIndex } from "@/libs/changeIndex";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  selectedCourse: string;
  selectedShift: string;
  intake: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AttendanceRecord {
  _id: string;
  studentId: Student | null; 
  status: "present" | "absent";
  createdAt: string;
  updatedAt: string;
}

interface GroupedAttendance {
  [date: string]: {
    [intake: string]: {
      [shift: string]: AttendanceRecord[];
    };
  };
}

const AttendancePage: React.FC = () => {
  const [groupedAttendance, setGroupedAttendance] = useState<GroupedAttendance>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAttendance, setFilteredAttendance] =
    useState<GroupedAttendance>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/students/attendance`);
        const data: AttendanceRecord[] = response.data;
        console.log("Fetched Data:", data); 
        groupAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
      finally{
        setLoading(false)
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [searchTerm, groupedAttendance, selectedDate, selectedShift]);

  const groupAttendanceData = (data: AttendanceRecord[]) => {
    // Sort data from newest to oldest
    const sortedData = data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const grouped = sortedData.reduce<GroupedAttendance>((acc, record) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      const intake = record.studentId
        ? record.studentId.intake
        : "Unknown Intake";
      const shift = record.studentId
        ? record.studentId.selectedShift
        : "Unknown Shift";

      acc[date] = acc[date] || {};
      acc[date][intake] = acc[date][intake] || {};
      acc[date][intake][shift] = acc[date][intake][shift] || [];

      acc[date][intake][shift].push(record);
      return acc;
    }, {});

    setGroupedAttendance(grouped);

    const shifts = new Set<string>();
    Object.values(grouped).forEach((intakes) =>
      Object.values(intakes).forEach((shiftRecords) =>
        Object.keys(shiftRecords).forEach((shift) => shifts.add(shift))
      )
    );

    const shiftArray = Array.from(shifts);
    changeIndex(shiftArray, 5, 2);
    changeIndex(shiftArray, 5, 3);

    console.log(shiftArray);
    setAvailableShifts(shiftArray);
  };


  const filterAttendance = () => {
    const filtered: GroupedAttendance = {};

    Object.entries(groupedAttendance).forEach(([date, intakes]) => {
      const recordDate = new Date(date);
      if (
        (!selectedDate ||
          recordDate.toDateString() === selectedDate.toDateString()) &&
        (!selectedShift ||
          Object.keys(intakes).some((intake) =>
            Object.keys(intakes[intake]).includes(selectedShift)
          ))
      ) {
        Object.entries(intakes).forEach(([intake, shifts]) => {
          Object.entries(shifts).forEach(([shift, records]) => {
            if (!selectedShift || shift === selectedShift) {
              const filteredRecords = records.filter(
                (record) =>
                  record.studentId &&
                  record.studentId.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              );

              if (filteredRecords.length > 0) {
                filtered[date] = filtered[date] || {};
                filtered[date][intake] = filtered[date][intake] || {};
                filtered[date][intake][shift] = filteredRecords;
              }
            }
          });
        });
      }
    });

    setFilteredAttendance(filtered);
  };
if (loading) {
  return (
    <div className="text-center mt-20">
      <SideBar />
      <Loader />
    </div>
  );
}
  return (
    <div className="container mx-auto p-4">
      <SideBar />
      <h1 className="text-3xl font-bold mb-6">Attendance Records</h1>
      <div className="mb-4 flex space-x-4">
        <input
          type="text"
          placeholder="Search by student name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholderText="Select date"
        />
      </div>
      <div className="mb-4 flex space-x-2 overflow-x-auto">
        <button
          className={`px-4 py-2 rounded-md ${
            selectedShift === null ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedShift(null)}
        >
          All Shifts
        </button>
        {  
        availableShifts.map((shift) => (
          <button
            key={shift}
            className={`px-4 py-2 rounded-md ${
              selectedShift === shift ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setSelectedShift(shift)}
          >
            {shift}
          </button>
        ))}
      </div>
      {Object.entries(filteredAttendance).length === 0 ? (
        <p>No attendance records found for the selected criteria.</p>
      ) : (
        Object.entries(filteredAttendance).map(([date, intakes]) => (
          <div key={date} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{date}</h2>
            {Object.entries(intakes).map(([intake, shifts]) => (
              <div key={intake} className="mb-6">
                <h3 className="text-xl font-medium mb-3">{intake}</h3>
                {Object.entries(shifts).map(([shift, records]) => (
                  <div key={shift} className="mb-4">
                    <h4 className="text-lg font-medium mb-2">{shift}</h4>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {records.map((record) => (
                            <tr key={record._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.studentId
                                  ? record.studentId.name
                                  : "Unknown Student"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    record.status === "present"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(
                                  record.updatedAt
                                ).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default withAdminAuth(AttendancePage);
