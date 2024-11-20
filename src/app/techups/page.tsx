"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { Search } from "lucide-react";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import Loader from "@/components/loader";
import { toast } from "react-toastify";

interface Student {
  _id: string;
  name: string;
  phone: string;
  email:string
  updatedAt: string;
  createdAt: string;
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [succes, setSucces] = useState<string | null>(null);
  const [isOpenMessage, setOpenMessage] = useState(false);
  const [char, Setchar] = useState(250);


  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
const [emailBody,setEmailBody]=useState('')
const [smsBody,setsmsBody]=useState('')
const [subject,setsubject]=useState('')
const closePopup = () => {
  setOpenMessage(false);
  setError(null);
  setSucces(null);
};
  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(
        `${API_BASE_URL}/students/techup`
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const phone = event.target.value;
    if (event.target.checked) {
      setSelectedStudents((prev) => [
        ...prev,
        students.find((student) => student.phone === phone)!,
      ]);
    } else {
      setSelectedStudents((prev) =>
        prev.filter((student) => student.phone !== phone)
      );
    }
  };

  const deleteSelectedStudents = async () => {
    try {
      const phones = selectedStudents.map((student) => student.phone);
      await axios.delete(`${API_BASE_URL}/students/delete`, {
        data: { phones },
      });
      setStudents(
        students.filter((student) => !selectedStudents.includes(student))
      );
      setSelectedStudents([]);
      alert("Selected students deleted successfully.");
    } catch (error) {
      console.error("Error deleting students:", error);
      alert("Failed to delete selected students. Please try again later.");
    }
  };

  const sendSmsToSelected = async () => {
    try {
      const phones = selectedStudents.map((student) => student.phone);
      const emails = selectedStudents.map((student) => student.email);
      
     
      await axios.post(`${API_BASE_URL}/students/techup/notify`, {
        smsBody,
        phones,
        emailBody,
        emails,
        subject,
      });
     toast.success('message sent')
    } catch (error) {
      toast.error('failed to send sms')
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="text-center mt-20">
        <SideBar />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6">
      <SideBar />
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 flex flex-col sm:flex-row justify-between items-center shadow-md rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            STUDENTS
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setOpenMessage(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold"
            >
              Notify
            </button>
            <button
              onClick={deleteSelectedStudents}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold"
            >
              Delete Selected
            </button>
          </div>
        </div>
        {error && <p className="text-red-600 p-4 text-center">{error}</p>}

        <div className="p-4">
          <div className="relative w-full sm:w-64 mb-4">
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(students.map((s) => s));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                      checked={selectedStudents.length === students.length}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        value={student.phone}
                        checked={selectedStudents.some(
                          (s) => s.phone === student.phone
                        )}
                        onChange={handleCheckboxChange}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {student.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {isOpenMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">
               FIll the box
              </h3>
              <p className="text-end  test-sm text-blue-500"> {char} left</p>
              <textarea
                className="w-full p-2 border rounded-lg mb-4"
                rows={4}
                // maxLength={145}
                value={smsBody}
                onChange={(e) => {
                  setsmsBody(e.target.value);
                  Setchar(char - 1);
                }}
                placeholder="Type your sms here..."
              />
              <input type="text"
                className="w-full p-2 border rounded-lg mb-4"
                maxLength={50}
                value={subject}
                onChange={(e) => {
                  setsubject(e.target.value);
                }}
                placeholder="Type email subject here here..."
              />
              <textarea
                className="w-full p-2 border rounded-lg mb-4"
                rows={4}
                // maxLength={145}
                value={emailBody}
                onChange={(e) => {
                  setEmailBody(e.target.value);
                }}
                placeholder="Type your email body"
              />
              
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={closePopup}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={sendSmsToSelected}
                >
                  Send
                </button>
              </div>
              <p
                className={`${
                  error ? "text-red-500" : "text-green-600"
                } font-bold text-xl animate-pulse text-center`}
              >
                {error || succes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAdminAuth(StudentManagement);
