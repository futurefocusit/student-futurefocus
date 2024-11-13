"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { Search } from "lucide-react";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { IInvoice, TeamMember } from "@/types/types";
import { hasPermission } from "@/libs/hasPermission";
import Loader from "@/components/loader";
import { formatMonth } from "@/libs/formatDate";
import {
  generateRegisterStatementPdf,
  generateStatementPdf,
} from "@/libs/generateInvoice";
import { convertImageUrlToBase64 } from "@/libs/convertImage";
// import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sendMessage, smsInterface } from "@/libs/sendsms";
const imageUrl = "/futurefocuslogo.png";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  intake: string;
  selectedCourse: string;
  message: string;
  selectedShift: string;
  updatedAt: string;
  createdAt: string;
  status: string;
  comment: string;
}

interface Payment {
  studentId: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  _id: string;
}

interface Course {
  title: string;
  shifts: string[];
}

interface GroupedStudents {
  [key: string]: Student[];
}

const StudentManagement: React.FC = () => {
  const smsData: smsInterface = {
    key: "XQ3TsNiDdca2/PHGg/StwBnSIzJHW8Mi6DdDxOjUGRHHOhPt0ZCSqzvyT+/0IKWCnAIzYJtTIRMIwmKTel6v5w==",
    message: "you are admitted",
    recipients: ["0787910406"],
  };
  // const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  let defaultFilter;
  if (filter) {
    defaultFilter = filter;
  } else {
    defaultFilter = "pending";
  }
  const [students, setStudents] = useState<Student[]>([]);
  const [payment, setPayment] = useState<Payment[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [type, setType] = useState("");
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>(
    {}
  );
  const [openView, setOpenView] = useState(false)
  const [openPay, setOpenPay] = useState(false)
  const [commentText, setComment] = useState({ comment: "" });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [studentToRegister, setStudentToRegister] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    user: loggedUser?.name,
    method: "",
  });

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };
  const handleViewP = (student: Student, type: string) => {
    setSelectedStudent(student);
    setType(type);
    setOpenPay(true)
  };
  const getStudentCountByStatus = (
    students: Student[]
  ): Record<string, number> => {
    return students.reduce((acc, student) => {
      acc[student.status] = (acc[student.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };
  const processStatusChange = async (
    id: string,
    name: string,
    newStatus: string,
    user: string
  ) => {
    try {
      const ourlogo = await convertImageUrlToBase64(imageUrl as string);
      const data: IInvoice = {
        student: name,
        amount: 10000,
        reason: "Registration fees",
        date: new Date(),
        remaining: 0,
        status: "",
        paymentMethod: paymentMethod,
      };

      await axios.put(`${API_BASE_URL}/students/${id}`, {
        status: newStatus,
        user,
        paymentMethod,
      });
      setError(null);
      setSucces("status changed");

      if (newStatus === "registered") {
        generateRegisterStatementPdf(data, ourlogo);
      } else if (newStatus === "accepted") {
        sendMessage(smsData);
      } await fetchStudents();
      setPaymentMethod("");
      setStudentToRegister(null);
    } catch (error) {
      console.log(error)
      setSucces(null);
      setError("failed to change status");
    }
  };

  const handlePay = async (id: string) => {
    try {
      setIsPaying(true)
      formData.user = loggedUser?.name;
      const response = await axios.post(
        `${API_BASE_URL}/payment/pay/${id}`,
        formData
      );
      setSucces(response.data.message);
      setError(null);
      const ourlogo = await convertImageUrlToBase64(imageUrl as string);
      generateStatementPdf(response.data.data, ourlogo as string);
      fetchPayment();
    } catch (error) {
      console.log(error);
      setSucces(null);
      setError("Error happened! check payment and try again");
    }finally{
      setIsPaying(false)
    }
  };
  const handleDiscount = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/payment/discount/${id}`,
        formData
      );
      setSucces(response.data.message);
      setError(null);

      fetchPayment();
    } catch (error) {
      console.log(error)
      setError("Error happened! check payment and try again");
      setSucces(null);
    }
  };
  const handleExtra = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/payment/extra/${id}`,
        formData
      );
      setSucces(response.data.message);
      setError(null);
      fetchPayment();
    } catch (error) {
      console.log(error)
      setError("Error happened! check payment and try again");
      setSucces(null);
    }
  };
  const setCommentText = (value: string) => {
    setComment((prev) => ({ ...prev, comment: value }));
  };
  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(`${API_BASE_URL}/students`);
      await fetchLoggedUser();
      const sortedStudents = response.data.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setStudents(sortedStudents);
      setStudentCounts(getStudentCountByStatus(sortedStudents));
      filterStudents(activeFilter, sortedStudents);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/course`);
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
    }
  };
  const handleUpdateStudent = async (student: Student) => {
    setSelectedStudent(student);
    setUpdateMode(true);
    console.log(student)
  };

  const handleSaveUpdate = async () => {
    if (!selectedStudent) return;

    try {
      await axios.put(
        `${API_BASE_URL}/students/update/${selectedStudent._id}`,
        {
          selectedCourse: selectedStudent.selectedCourse,
          selectedShift: selectedStudent.selectedShift,
          intake: selectedStudent.intake,
        }
      );
      setSucces("updated student successfully");
      setError(null);
      await fetchStudents();
      setSelectedStudent(null);
      setUpdateMode(false);
    } catch (error) {
      console.error("Error updating student:", error);
      setSucces(null);
      setError("Failed to update student. Please try again.");
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
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}`);
      const updatedStudents = students.filter((student) => student._id !== id);
      setStudents(updatedStudents);
      filterStudents(activeFilter, updatedStudents);
      setSelectedStudent(null);
      setError(null);
      setSucces("deleted student successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    }
  };

  const handleView = (student: Student) => {
    setOpenView(true)
    setSelectedStudent(student);
  };
  const handleDisableView=()=>{
    setOpenView(false);
    setSelectedStudent(null);
  }
 
  const handleDisableViewP=()=>{
    setOpenPay(false);
    setSelectedStudent(null);
  }

  const handleStatusChange = async (
    id: string,
    name: string,
    newStatus: string,
    user: string
  ) => {
    if (newStatus === "registered") {
      setStudentToRegister({ id, name });
      setIsPaymentModalOpen(true);
      return;
    }

    try {
      await processStatusChange(id, name, newStatus, user);
    } catch (error) {
      console.error(`Error changing student status to ${newStatus}:`, error);
      setError(
        `Failed to change student status to ${newStatus}. Please try again.`
      );
    }
  };
  const handleAttend = async (id: string) => {
    try {
      await axios.put(`${API_BASE_URL}/students/attend/${id}`);
      setSucces("attend succesfully");
      setError(null);
      await fetchStudents();
    } catch (error) {
      console.log(error)
      setError(`Failed to attend student. Please try again.`);
      setError(null);
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

  const handleSaveComment = async (studentId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/students/comment/${studentId}`, {
        comment: commentText.comment,
      });
      setError(null);
      setSucces("comment savec");
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
        {hasPermission(loggedUser as TeamMember, "students", "delete") ? (
          <button
            onClick={() => handleDelete(student._id)}
            className="text-red-600 ml-3 hover:text-red-900"
          >
            Delete
          </button>
        ) : (
          ""
        )}
        
        {hasPermission(loggedUser as TeamMember, "students", "comment") ? (
          <div className="">
            <input
              className="p-1 bg-gray-200 border-2 border-gray-500 rounded-md"
              type="text"
              placeholder="type comment..."
              defaultValue={student.comment}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button
              onClick={() => handleSaveComment(student._id)}
              className="text-blue-600 ml-3 hover:text-blue-900"
            >
              save
            </button>
          </div>
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

            {hasPermission(loggedUser as TeamMember, "students", "admit") ? (
              <button
                onClick={() =>
                  handleStatusChange(
                    student._id,
                    student.name,
                    "accepted",
                    loggedUser?.name as string
                  )
                }
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Admit
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "students", "update") ? (
              <button
                onClick={() => handleUpdateStudent(student)}
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Update
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
            {hasPermission(loggedUser as TeamMember, "students", "attend") ? (
              <button
                onClick={() => handleUpdateStudent(student)}
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Update
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "students", "register") ? (
              <button
                onClick={() =>
                  handleStatusChange(
                    student._id,
                    student.name,
                    "registered",
                    loggedUser?.name as string
                  )
                }
                className="text-blue-600 hover:text-blue-900 ml-3"
              >
                Register
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
            {hasPermission(loggedUser as TeamMember, "students", "attend") ? (
              <button
                onClick={() => handleUpdateStudent(student)}
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Update
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
              <button
                onClick={() => handleViewP(student, "pay")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                Pay
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "discount") ? (
              <button
                onClick={() => handleViewP(student, "discount")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                -
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "add-extra") ? (
              <button
                onClick={() => handleViewP(student, "extra")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                +
              </button>
            ) : (
              ""
            )}

            {hasPermission(loggedUser as TeamMember, "students", "start") ? (
              <button
                onClick={() =>
                  handleStatusChange(
                    student._id,
                    student.name,
                    "started",
                    loggedUser?.name as string
                  )
                }
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Start
              </button>
            ) : (
              ""
            )}
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
              onClick={() => handleStatusChange(student._id, "droppedout")}
              className="text-yellow-600 hover:text-yellow-900 ml-3"
            >
              Dropout
            </button> */}
            {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
              <button
                onClick={() => handleViewP(student, "pay")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                Pay
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "discount") ? (
              <button
                onClick={() => handleViewP(student, "discount")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                -
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "add-extra") ? (
              <button
                onClick={() => handleViewP(student, "extra")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                +
              </button>
            ) : (
              ""
            )}
          
            {hasPermission(loggedUser as TeamMember, "students", "attend") ? (
              <button
                onClick={() => handleAttend(student._id)}
                className="text-green-600 hover:text-green-900 ml-3"
              >
                Attend
              </button>
            ) : (
              ""
            )}
          </>
        );
        case "droppedout":return (
          <>
            {commonButtons}
            {hasPermission(loggedUser as TeamMember, "students", "update") ? (
              <button
                onClick={() =>
                  handleStatusChange(
                    student._id,
                    student.name,
                    "started",
                    loggedUser?.name as string
                  )
                }
                className="text-green-600 hover:text-green-900 ml-3"
              >
              Reactivate
              </button>
            ) : (
              ""
            )}
          </>
        );
       case "completed":
      default:
        return null;
    }
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
    <div className="min-h-screen bg-gray-100 p-2 sm:p-4 lg:p-6">
      <SideBar />
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 flex flex-col sm:flex-row justify-between items-center shadow-md rounded-lg p-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Students
          </h2>
          {hasPermission(loggedUser as TeamMember, "students", "register") && (
            <a
              href="/students/register-new"
              className="px-4 py-2 bg-green-400 hover:bg-green-700 rounded-lg text-white font-bold"
            >
              New
            </a>
          )}
        </div>
        {error ||
          (succes && (
            <p
              className={`${
                error ? " text-red-600" : "text-green-500"
              } p-4 text-center`}
            >
              {error}
            </p>
          ))}

        <div className="p-4 space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {[
                "pending",
                "accepted",
                "registered",
                "started",
                "completed",
                "droppedout",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => filterStudents(status)}
                  className={`px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    activeFilter === status ? "bg-indigo-100" : ""
                  }`}
                >
                  {status === "pending"
                    ? `Candidates (${studentCounts[status] || 0}) `
                    : status === "accepted"
                    ? `Admitted (${studentCounts[status] || 0})`
                    : status === "started"
                    ? `Active (${studentCounts[status] || 0})`
                    : `${status.charAt(0).toUpperCase() + status.slice(1)} (${
                        studentCounts[status] || 0
                      })`}
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
                <table className="min-w-full divide-y divide-gray-200 ">
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
                          <div className="flex  gap-2">
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

          {selectedStudent && updateMode && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg">
                <div className="bg-gray-50 p-6 h-96 overflow-scroll">
                  <h3 className="text-lg font-medium text-gray-900">
                    Update Student
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select Course
                      </label>
                      <select
                        value={selectedStudent.selectedCourse}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            selectedCourse: e.target.value,
                            selectedShift:
                              courses.find((c) => c.title === e.target.value)
                                ?.shifts[0] || selectedStudent.selectedShift,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {courses.map((course) => (
                          <option key={course.title} value={course.title}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select Shift
                      </label>
                      <select
                        value={selectedStudent.selectedShift}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            selectedShift: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {courses
                          .find(
                            (course) =>
                              course.title === selectedStudent.selectedCourse
                          )
                          ?.shifts.map((shift) => (
                            <option key={shift} value={shift}>
                              {shift}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Select intake
                      </label>
                      <input
                        type="text"
                        disabled
                        value={selectedStudent.intake}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="month"
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            intake: formatMonth(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 flex justify-end">
                  <button
                    onClick={handleSaveUpdate}
                    className="mr-2 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setUpdateMode(false);
                    }}
                    className="inline-flex justify-center px-4 py-2 text-sm text-black font-medium bg-gray-200 border border-transparent rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {selectedStudent && openView && (
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
                    onClick={() => handleDisableView()}
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
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Select Payment Method
              </h3>
            </div>
            <div className="mb-4">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="momo">Mobile Money</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (studentToRegister && paymentMethod) {
                    processStatusChange(
                      studentToRegister.id,
                      studentToRegister.name,
                      "registered",
                      loggedUser?.name as string
                    );
                    setIsPaymentModalOpen(false);
                  }
                }}
                disabled={!paymentMethod}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md ${
                  !paymentMethod
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedStudent && type && openPay && (
        <div className="fixed inset-0 flex  items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg overflow-hidden h-64 shadow-xl transform transition-all sm:w-full sm:max-w-lg">
            <div className="bg-gray-50  overflow-scroll">
              <h3 className="text-lg text-center bg-blue-600 text-white font-extrabold">
                {type === "pay"
                  ? "Pay School Fees"
                  : type === "discount"
                  ? "Add Discount"
                  : "Add Extra"}
              </h3>
              <div className="mt-4 flex  flex-col gap-5">
                <span className="flex gap-10 items-center mx-auto mb-3">
                  <label className="font-extrabold" htmlFor="amount">
                    Amount:
                  </label>
                  <input
                    name="amount"
                    type="number"
                    onChange={handleFormData}
                    placeholder="Amount in Frw"
                    className="border-2 p-2 rounded-md border-blue-700"
                  />
                </span>
                {type === "pay" ? (
                  <span className="flex gap-10 items-center mx-auto mb-3">
                    <p className="font-extrabold">method of payment:</p>
                    <input
                      name="method"
                      type="text"
                      onChange={handleFormData}
                      placeholder="type Method"
                      className="border-2 p-2 rounded-md border-blue-700"
                    />
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="bg-gray-50 p-4 flex justify-around">
              <button
                onClick={
                  type === "pay"
                    ? () => handlePay(selectedStudent._id)
                    : type === "discount"
                    ? () => handleDiscount(selectedStudent._id)
                    : () => handleExtra(selectedStudent._id)
                }
                className="px-4 py-2 text-sm text-black font-extrabold hover:text-white bg-green-300 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              >
                {type === "pay"
                  ? isPaying
                    ? "Paying..."
                    : "Pay"
                  : type === "discount"
                  ? "Add Discount"
                  : "Add Extra"}
              </button>
              <button
                onClick={() => handleDisableViewP()}
                className="px-4 py-2 text-sm text-black font-extrabold hover:text-white bg-red-300 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdminAuth(StudentManagement);
