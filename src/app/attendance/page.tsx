"use client";
import Loader from "@/components/loader";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import { changeIndex } from "@/libs/changeIndex";
import { AttendanceRecord, GroupedAttendance } from "@/types/types";
import axios from "axios";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/students/attendance`);
        const data: AttendanceRecord[] = response.data;
        groupAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      filterAttendance();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, groupedAttendance, selectedDate, selectedShift]);

  const groupAttendanceData = (data: AttendanceRecord[]) => {
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
    setAvailableShifts(shiftArray);
  };

  const filterAttendance = () => {
    const filtered: GroupedAttendance = {};
    let resultCount = 0;

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
              const filteredRecords = records.filter((record) => {
                const studentName = record.studentId?.name || "";
                return studentName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase().trim());
              });

              if (filteredRecords.length > 0) {
                filtered[date] = filtered[date] || {};
                filtered[date][intake] = filtered[date][intake] || {};
                filtered[date][intake][shift] = filteredRecords;
                resultCount += filteredRecords.length;
              }
            }
          });
        });
      }
    });

    setTotalResults(resultCount);
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

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by student name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => setSelectedDate(date)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText="Select date"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedShift === null
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedShift(null)}
          >
            All Shifts
          </button>
          {availableShifts.map((shift) => (
            <button
              key={shift}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedShift === shift
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelectedShift(shift)}
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      {searchTerm && (
        <div className="text-sm text-gray-600 mb-4">
          Found {totalResults} {totalResults === 1 ? "student" : "students"}{" "}
          matching "{searchTerm}"
        </div>
      )}

      {Object.entries(filteredAttendance).length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {searchTerm
              ? `No attendance records found for "${searchTerm}"`
              : "No attendance records found for the selected criteria."}
          </p>
        </div>
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
