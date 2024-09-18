"use client";
import API_BASE_URL from "@/config/baseURL";
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
  studentId: Student;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/students/attendance`);
        const data: AttendanceRecord[] = await response.data;
        groupAttendanceData(data);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [searchTerm, groupedAttendance, selectedDate, selectedShift]);

  const groupAttendanceData = (data: AttendanceRecord[]) => {
    const grouped = data.reduce<GroupedAttendance>((acc, record) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      const intake = record.studentId.intake;
      const shift = record.studentId.selectedShift;

      if (!acc[date]) acc[date] = {};
      if (!acc[date][intake]) acc[date][intake] = {};
      if (!acc[date][intake][shift]) acc[date][intake][shift] = [];

      acc[date][intake][shift].push(record);
      return acc;
    }, {});

    setGroupedAttendance(grouped);

    // Extract unique shifts
    const shifts = new Set<string>();
    Object.values(grouped).forEach((intakes) =>
      Object.values(intakes).forEach((shiftRecords) =>
        Object.keys(shiftRecords).forEach((shift) => shifts.add(shift))
      )
    );
    setAvailableShifts(Array.from(shifts));
  };

  const filterAttendance = () => {
    let filtered: GroupedAttendance = {};

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
              const filteredRecords = records.filter((record) =>
                record.studentId.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              );

              if (filteredRecords.length > 0) {
                if (!filtered[date]) filtered[date] = {};
                if (!filtered[date][intake]) filtered[date][intake] = {};
                if (!filtered[date][intake][shift])
                  filtered[date][intake][shift] = [];
                filtered[date][intake][shift] = filteredRecords;
              }
            }
          });
        });
      }
    });

    setFilteredAttendance(filtered);
  };

  return (
    <div className="container mx-auto p-4">
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
          //@ts-ignore
          onChange={(date: Date) => setSelectedDate(date)}
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
        {availableShifts.map((shift) => (
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
      {Object.entries(filteredAttendance).map(([date, intakes]) => (
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
                              {record.studentId.name}
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
                              {new Date(record.createdAt).toLocaleTimeString()}
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
      ))}
    </div>
  );
};

export default AttendancePage;
