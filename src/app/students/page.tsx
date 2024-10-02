"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { Search } from "lucide-react";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { IUser } from "@/types/types";
import { fetchUser, getLoggedUserData } from "@/context/adminAuth";
import { hasPermission } from "@/libs/hasPermission";

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
  comment:string
}
interface Payment {
  studentId: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  _id: string;
}

interface GroupedStudents {
  [key: string]: Student[];
}

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [payment, setPayment] = useState<Payment[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("pending");
  const [searchTerm, setSearchTerm] = useState<string>("");
 const [userData ,setUserData]= useState<IUser>()
 const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
 const [commentText, setCommentText] = useState("");
 const [commentStudent, setCommentStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(`${API_BASE_URL}/students`);
      await fetchUser()
      setUserData(await getLoggedUserData())
      const sortedStudents = response.data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setStudents(sortedStudents);
      filterStudents(activeFilter, sortedStudents);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student data. Please try again later.");
    }
  };
  const fetchPayment = async () => {
    try {
      const response = await axios.get<Payment[]>(`${API_BASE_URL}/payment`);
      setPayment(response.data);
    } catch (error) {
      console.error("Error fetching payment data:", error);
      setError("Failed to load payment data. Please reload.");
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
    fetchPayment();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}`);
      const updatedStudents = students.filter((student) => student._id !== id);
      setStudents(updatedStudents);
      filterStudents(activeFilter, updatedStudents);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.put(`${API_BASE_URL}/students/${id}`, { status: newStatus });
      await fetchStudents();
    } catch (error) {
      console.error(`Error changing student status to ${newStatus}:`, error);
      setError(
        `Failed to change student status to ${newStatus}. Please try again.`
      );
    }
  };
  const handleAttend = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/students/attend/${id}`)
      await fetchStudents();
    
    } catch (error) {
      setError(
        `Failed to attend student. Please try again.`
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filterStudents = (
    status: string,
    studentsData: Student[] = students
  ) => {
    setActiveFilter(status);
    setSearchTerm("");
    const filteredStudents = studentsData.filter(
      (student) => student.status === status
    );
    groupStudentsByIntake(filteredStudents);
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
   const handleComment = (studentId: string) => {
     const student = students.find((s) => s._id === studentId);
     if (student) {
       setCommentStudent(student);
       setCommentText(student.comment || "");
       setIsCommentModalOpen(true);
     }
   };

   const handleSaveComment = async () => {
     if (!commentStudent) return;

     try {
       await axios.put(`${API_BASE_URL}/students/comment/${commentStudent._id}`, {
         comment: commentText,
       });

       // Update the local state
       const updatedStudents = students.map((student) =>
         student._id === commentStudent._id
           ? { ...student, comment: commentText }
           : student
       );
       setStudents(updatedStudents);
       filterStudents(activeFilter, updatedStudents);

       setIsCommentModalOpen(false);
       setCommentStudent(null);
       setCommentText("");
     } catch (error) {
       console.error("Error saving comment:", error);
       setError("Failed to save comment. Please try again.");
     }
   };

  const renderActionButtons = (student: Student) => {
    const commonButtons = (
      <>
        <button
          onClick={() => handleView(student)}
          className="text-indigo-600 hover:text-indigo-900 mr-3"
        >
          View
        </button>
        {hasPermission(userData as IUser, "students", "delete") ? (
          <button
            onClick={() => handleDelete(student._id)}
            className="text-red-600 ml-3 hover:text-red-900"
          >
            Delete
          </button>
        ) : (
          ""
        )}
      </>
    );
  
    switch (student.status) {
      case "pending":
        return (
          <>
            {commonButtons}
            {hasPermission(userData as IUser, "students", "admit") ? (
              <button
                onClick={() => handleStatusChange(student._id, "accepted")}
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Admit
              </button>
            ) : (
              ""
            )}
            {hasPermission(userData as IUser, "students", "comment") ? (
              <button
                onClick={() => handleComment(student._id)}
                className="text-blue-600 ml-3 hover:text-blue-900"
              >
                comment
              </button>
            ) : (
              ""
            )}
          </>
        );
      case "accepted":
        return (
          <>
            {commonButtons}
            {hasPermission(userData as IUser, "students", "register") ? (
              <button
                onClick={() => handleStatusChange(student._id, "registered")}
                className="text-blue-600 hover:text-blue-900 ml-3"
              >
                Register
              </button>
            ) : (
              ""
            )}
            {hasPermission(userData as IUser, "students", "comment") ? (
              <button
                onClick={() => handleComment(student._id)}
                className="text-blue-600 ml-3 hover:text-blue-900"
              >
                comment
              </button>
            ) : (
              ""
            )}
          </>
        );
      case "registered":
        return (
          <>
            {commonButtons}
            {/* <button
              onClick={() => handleStatusChange(student._id, "started")}
              className="text-green-600 hover:text-green-900 ml-3"
            >
              Start
            </button> */}
          </>
        );
      case "started":
        return (
          <>
            {commonButtons}
            {/* <button
              onClick={() => handleStatusChange(student._id, "completed")}
              className="text-green-600 hover:text-green-900 ml-3"
            >
              Complete
            </button> */}
            {/* <button
              onClick={() => handleStatusChange(student._id, "dropedout")}
              className="text-yellow-600 hover:text-yellow-900 ml-3"
            >
              Dropout
            </button> */}
            {hasPermission(userData as IUser, "students", "attend")?<button
              onClick={() => handleAttend(student._id)}
              className="text-green-600 hover:text-green-900 ml-3"
            >
              Attend
            </button>:""}
          </>
        );
      case "completed":
      case "dropedout":
        return commonButtons;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6">
      <SideBar />

      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 flex flex-col sm:flex-row justify-between items-center shadow-md rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Applied Students
          </h2>
          {hasPermission(userData as IUser, "students", "register") && (
            <a
              href="/students/register-new"
              className="px-4 py-2 bg-green-400 hover:bg-green-700 rounded-lg text-white font-bold"
            >
              New
            </a>
          )}
        </div>
        {error && <p className="text-red-600 p-4 text-center">{error}</p>}

        <div className="p-4 space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {[
                "pending",
                "accepted",
                "registered",
                "started",
                "completed",
                "dropedout",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => filterStudents(status)}
                  className={`px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    activeFilter === status ? "bg-indigo-100" : ""
                  }`}
                >
                  {status === "pending"
                    ? "Candidates"
                    : status === "accepted"
                    ? "Admitted"
                    : status === "started"
                    ? "Active"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
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
              <h3 className="text-lg sm:text-xl font-semibold mb-4">
                Intake: {intake}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Phone
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Payment Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {intakeStudents.map((student, index) => (
                      <tr key={student._id}>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {student.phone}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {student.phone}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {payment &&
                            payment.filter(
                              (payment) => payment.studentId === student._id
                            ).length === 0 ? (
                              <div>No payment info</div>
                            ) : (
                              payment &&
                              payment
                                .filter(
                                  (payment) => payment.studentId === student._id
                                )
                                .map((filteredPayment) => (
                                  <div key={filteredPayment._id}>
                                    {filteredPayment.status.toUpperCase()}
                                  </div>
                                ))
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {renderActionButtons(student)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {isCommentModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg">
                <div className="bg-gray-50 p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {commentStudent?.comment ? "Edit Comment" : "Add Comment"}
                  </h3>
                  <div className="mt-4">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={4}
                      placeholder="Enter your comment here..."
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setIsCommentModalOpen(false);
                      setCommentStudent(null);
                      setCommentText("");
                    }}
                    className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveComment}
                    className="px-4 py-2 text-sm text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Save Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedStudent && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg ">
                <div className="bg-gray-50 p-6 h-96 overflow-scroll">
                  <h3 className="text-lg font-medium text-gray-900">
                    Student Details
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedStudent.name}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedStudent.email}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {selectedStudent.phone}
                    </p>
                    <p>
                      <span className="font-semibold">Intake:</span>{" "}
                      {selectedStudent.intake}
                    </p>
                    <p>
                      <span className="font-semibold">Course:</span>{" "}
                      {selectedStudent.selectedCourse}
                    </p>
                    <p>
                      <span className="font-semibold">Message:</span>{" "}
                      {selectedStudent.message}
                    </p>
                    <p>
                      <span className="font-semibold">Shift:</span>{" "}
                      {selectedStudent.selectedShift}
                    </p>
                    <p>
                      <span className="font-semibold">Applied on:</span>{" "}
                      {formatDate(selectedStudent.createdAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      {selectedStudent.status}
                    </p>
                    {payment &&
                    payment.filter(
                      (payment) => payment.studentId === selectedStudent._id
                    ).length === 0 ? (
                      <div>No payment information found.</div>
                    ) : (
                      payment &&
                      payment
                        .filter(
                          (payment) => payment.studentId === selectedStudent._id
                        )
                        .map((filteredPayment) => (
                          <div key={filteredPayment._id}>
                            <p>
                              <span className="font-semibold">
                                Payment Status:
                              </span>{" "}
                              <span
                                className={`${
                                  filteredPayment.status === "unpaid"
                                    ? "bg-red-600"
                                    : filteredPayment.status === "partial"
                                    ? "bg-red-400"
                                    : filteredPayment.status === "paid"
                                    ? "bg-blue-700"
                                    : "bg-green-600"
                                } font-extrabold text-white p-2 rounded-md`}
                              >
                                {filteredPayment.status.toUpperCase()}
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold">
                                Total To pay:
                              </span>{" "}
                              <span className=" text-green-600 font-extrabold">
                                {new Intl.NumberFormat().format(
                                  filteredPayment.amountDue
                                )}{" "}
                                Frw
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold">Total Paid:</span>{" "}
                              <span className=" text-blue-600 font-extrabold">
                                {new Intl.NumberFormat().format(
                                  filteredPayment.amountPaid
                                )}{" "}
                                Frw
                              </span>
                            </p>
                            <p>
                              <span className="font-semibold">Remaining:</span>{" "}
                              <span className=" text-red-600 font-extrabold">
                                {new Intl.NumberFormat().format(
                                  filteredPayment.amountDue -
                                    filteredPayment.amountPaid
                                )}
                                Frw
                              </span>
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="inline-flex justify-center px-4 py-2 text-sm  text-black font-extrabold hover:text-white  bg-red-300 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(StudentManagement);
