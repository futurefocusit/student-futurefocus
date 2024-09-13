"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { X, Search, ChevronDown } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  intake: string;
  selectedCourse: string;
  message: string;
  selectedShift: string;
  createdAt: string;
  status: string;
}

interface GroupedStudents {
  [key: string]: Student[];
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("pending");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(`${API_BASE_URL}/students`);
      const sortedStudents = response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setStudents(sortedStudents);
      const pendingStudents = sortedStudents.filter(
        (student) => student.status === "pending"
      );
      groupStudentsByIntake(pendingStudents);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student data. Please try again later.");
    }
  };

  const groupStudentsByIntake = (studentsData: Student[]) => {
    const grouped = studentsData.reduce((acc: GroupedStudents, student) => {
      if (!acc[student.intake]) {
        acc[student.intake] = [];
      }
      acc[student.intake].push(student);
      return acc;
    }, {});
    setGroupedStudents(grouped);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}`);
      const updatedStudents = students.filter((student) => student._id !== id);
      setStudents(updatedStudents);
      const filteredStudents = updatedStudents.filter(
        (student) => student.status === activeFilter
      );
      groupStudentsByIntake(filteredStudents);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleAdmit = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/students/${id}`);
      await fetchStudents();
      filterStudents(activeFilter);
    } catch (error) {
      console.error("Error admitting student:", error);
      setError("Failed to admit student. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filterStudents = (status: string) => {
    setActiveFilter(status);
    setSearchTerm("");
    const filteredStudents = students.filter(
      (student) => student.status === status
    );
    groupStudentsByIntake(filteredStudents);
    setIsFilterMenuOpen(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const searchValue = event.target.value.toLowerCase();
    const filteredStudents = students.filter(
      (student) =>
        student.status === activeFilter &&
        (student.name.toLowerCase().includes(searchValue) ||
          student.email.toLowerCase().includes(searchValue) ||
          student.phone.toLowerCase().includes(searchValue))
    );
    groupStudentsByIntake(filteredStudents);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold p-6 bg-gray-50 text-gray-900 text-center border-b">
          Applied Candidates
        </h2>
        {error && <p className="text-red-600 p-4 text-center">{error}</p>}

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {activeFilter.toUpperCase()}
                <ChevronDown
                  className="ml-2 -mr-1 h-5 w-5 inline-block"
                  aria-hidden="true"
                />
              </button>
              {isFilterMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 ml-96 text-left  rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div
                    className="py-2"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    {[
                      "pending",
                      "accepted",
                      "registered",
                      "completed",
                      "dropedout",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => filterStudents(status)}
                        className="block w-full  px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 z-50"
                        role="menuitem"
                      >
                        {status === "pending"
                          ? "CANDIDATES"
                          : status === "registered"
                          ? "STUDENTS"
                          : status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search students"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {Object.entries(groupedStudents).map(([intake, intakeStudents]) => (
            <div key={intake} className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Intake: {intake}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Course
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {intakeStudents.map((student,index) => (
                      <tr key={student._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {index+1}
                          </div>
                          <div className="text-sm text-gray-500 sm:hidden">
                            {student.phone}
                          </div>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500 sm:hidden">
                              {student.phone}
                            </div>
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {student.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {student.selectedCourse}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleView(student)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Delete
                          </button>
                          {student.status === "pending" && (
                            <button
                              onClick={() => handleAdmit(student._id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Admit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Student Details</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {selectedStudent.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedStudent.email}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedStudent.phone}
                </p>
                <p>
                  <strong>Course:</strong> {selectedStudent.selectedCourse}
                </p>
                <p>
                  <strong>Shift:</strong> {selectedStudent.selectedShift}
                </p>
                <p>
                  <strong>Date Applied:</strong>{" "}
                  {formatDate(selectedStudent.createdAt)}
                </p>
                <p>
                  <strong>Message:</strong> {selectedStudent.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
