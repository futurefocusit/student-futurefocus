"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { Search } from 'lucide-react';
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
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaCommentSms } from "react-icons/fa6";
import ConfirmDeleteModal from "@/components/confirmPopupmodel";
import { toast } from "react-toastify";
const imageUrl = "/futurefocuslogo.png";

interface Student {
  _id: string;
  name: string;
  email: string;
  referer: "default" | "cyd";
  phone: string;
  intake: string;
  selectedCourse: string
    message: string;
  selectedShift: { _id: string; name: string; start: string; end: string };
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
  _id: string;
  shifts: { name: string; _id: string; start: string; end: string }[];
}

interface GroupedStudents {
  [key: string]: Student[];
}

const StudentManagement: React.FC = () => {
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  let defaultFilter;
  if (filter) {
    defaultFilter = filter;
  } else {
    defaultFilter = "pending";
  }
  const [confirmModelOpen, SetConfirmModel] = useState(false);
  const [confirmStatusModelOpen, SetConfirmStatusModel] = useState(false);
  const [confirmAttendModelOpen, SetConfirmAttendModel] = useState(false);
  const [confirmSaveModelOpen, SetConfirmSaveModel] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [payment, setPayment] = useState<Payment[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<GroupedStudents>({});
  const [error, setError] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [type, setType] = useState("");
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [char, Setchar] = useState(145);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("pending");
  const [isOpenMessage, setOpenMessage] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [action, setAction] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [commentText, setComment] = useState({ comment: "", student: "" });
  const [courses, setCourses] = useState<Course[]>([]);
  const [student, setStudent] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [updateMode, setUpdateMode] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [item, setItem] = useState<string | null>(null);
  const [items, setItems] = useState({ itemId: "", name: "", status: "" });
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [refererFilter, setRefererFilter] = useState<string>("default");

  const [studentToRegister, setStudentToRegister] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    user: loggedUser?.name,
    method: "",
  });
  const closePopup = () => {
    setOpenMessage(false);
    setError(null);
    setSucces(null);
  };
  const filterStudents = (
    status: string,
    referer: string,
    studentsData: Student[] = students
  ) => {
    setActiveFilter(status);
    setRefererFilter(referer);
    setSearchTerm("");
    const filteredStudents = studentsData.filter(
      (student) =>
        student.status === status && (referer === "all" || student.referer === referer)
    );
    groupStudentsByIntake(filteredStudents);
  };
  const handleDeleteClick = (itemId: string) => {
    setItem(itemId);
    SetConfirmModel(true);
  };
  const handleStatusClick = (itemId: string, name: string, status: string) => {
    setItems({ itemId, name, status });
    SetConfirmStatusModel(true);
  };
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (event.target.checked) {
      setSelectedValues((prev) => [...prev, value]);
    } else {
      setSelectedValues((prev) => prev.filter((item) => item !== value));
    }
  };

  const getAllPhoneNumbers = () => {
    return Object.values(groupedStudents)
      .flat()
      .map((student) => student.phone);
  };
  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setSelectedValues(getAllPhoneNumbers());
    } else {
      setSelectedValues([]);
    }
  };

  const areAllSelected = () => {
    const allPhones = getAllPhoneNumbers();
    return (
      allPhones.length > 0 &&
      allPhones.every((phone) => selectedValues.includes(phone))
    );
  };
  const handleSend = async () => {
    setIsLoading(true);
    try {
      if (message.trim()) {
        const response = await axios.post(
          `${API_BASE_URL}/others/sendmessage`,
          {
            message,
            recipients: selectedValues,
          },{
            headers:{
              "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
            }
          }
        );
        setSucces(response.data.message);
        setMessage("");
      } else {
        setError("enter message please");
      }
    } catch (error) {
      setError("internal server error");
    } finally {
      setIsLoading(false);
    }
  };
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
    setOpenPay(true);
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
    setIsLoading(true);
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
      },{
        headers:{
          "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
        }
      });
      setError(null);
      setSucces("status changed");

      if (newStatus === "registered") {
        generateRegisterStatementPdf(data, ourlogo);
      }
      await fetchStudents();
      setPaymentMethod("");
      setStudentToRegister(null);
    } catch (error) {
      console.log(error);
      setSucces(null);
      setError("failed to change status");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (id: string) => {
    try {
      setIsPaying(true);
      formData.user = loggedUser?.name;
      const response = await axios.post(
        `${API_BASE_URL}/payment/pay/${id}`,
        formData,{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
          }
        }
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
    } finally {
      setIsPaying(false);
    }
  };
  const handleDiscount = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/payment/discount/${id}`,
        formData,{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
          }
        }
      );
      setSucces(response.data.message);
      setError(null);

      fetchPayment();
    } catch (error) {
      console.log(error);
      setError("Error happened! check payment and try again");
      setSucces(null);
    }
  };
  const handleExtra = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/payment/extra/${id}`,
        formData,{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
          }
        }
      );
      setSucces(response.data.message);
      setError(null);
      fetchPayment();
    } catch (error) {
      console.log(error);
      setError("Error happened! check payment and try again");
      setSucces(null);
    } finally {
      setIsLoading(false);
    }
  };
  const setCommentText = (value: string) => {
    setComment((prev) => ({ ...prev, comment: value }));
  };
  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(`${API_BASE_URL}/students`,{
        headers:{
          "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
        }
      });
      await fetchLoggedUser();
      const sortedStudents = response.data.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      filterStudents(activeFilter, refererFilter,sortedStudents);
      setStudents(sortedStudents);
      setStudentCounts(getStudentCountByStatus(sortedStudents));
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load student data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/course`,{
        headers:{
          "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to load courses. Please try again later.");
    }
  };
  const handleUpdateStudent = async (student: Student) => {
    setSelectedStudent(student);
    setUpdateMode(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedStudent) return;

    try {
      setIsLoading(true);
      await axios.put(
        `${API_BASE_URL}/students/update/${selectedStudent._id}`,
        {
          selectedCourse: selectedStudent.selectedCourse,
          selectedShift: selectedStudent.selectedShift,
          intake: selectedStudent.intake,
          name: selectedStudent.name,
        },{
          headers:{
            "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
          }
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPayment = async () => {
    try {
      const response = await axios.get<Payment[]>(`${API_BASE_URL}/payment`,{
        headers:{
          "Authorization":`Bearer ${localStorage.getItem('ff-admin')}`
        }
      });
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
    // setActiveFilter("pending")
    fetchStudents()      
    fetchPayment();
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/students/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      const updatedStudents = students.filter(
        (student) => student._id !== id
      );
      setStudents(updatedStudents);
      filterStudents(activeFilter, refererFilter, updatedStudents);
      setSelectedStudent(null);
      setError(null);
      setSucces("deleted student successfully");
    } catch (error) {
      console.error("Error deleting student:", error);
      setError("Failed to delete student. Please try again.");
    } finally {
      SetConfirmModel(false);
      setIsLoading(false);
    }
  };

  const handleView = (student: Student) => {
    setOpenView(true);
    setSelectedStudent(student);
  };
  const handleDisableView = () => {
    setOpenView(false);
    setSelectedStudent(null);
  };

  const handleDisableViewP = () => {
    setOpenPay(false);
    setSelectedStudent(null);
  };

  const handleStatusChange = async (
    id: string,
    name: string,
    newStatus: string,
    user: string
  ) => {
    try {
      await processStatusChange(id, name, newStatus, user);
    } catch (error) {
      console.error(
        `Error changing student status to ${newStatus}:`,
        error
      );
      setError(
        `Failed to change student status to ${newStatus}. Please try again.`
      );
    } finally {
      SetConfirmStatusModel(false);
    }
  };
  const handleAttend = async (id: string) => {
    try {
      setIsLoading(true);
      await axios.put(`${API_BASE_URL}/students/attend/${id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      toast.success("attend succesfully");
      setError(null);
      await fetchStudents();
    } catch (error) {
      console.log(error);
      toast.error(`Failed to attend student. Please try again.`);
      setError(null);
    } finally {
      setIsLoading(false);
      SetConfirmAttendModel(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };



  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    const searchValue = event.target.value.toLowerCase();
    const filteredStudents = students.filter(
      (student) =>
        student.status === activeFilter &&
        (refererFilter === "all" || student.referer === refererFilter) &&
        (student.name.toLowerCase().includes(searchValue) ||
          student.email.toLowerCase().includes(searchValue) ||
          student.phone.toLowerCase().includes(searchValue))
    );
    groupStudentsByIntake(filteredStudents);
  };

  const handleSaveComment = async (student: string) => {
    try {
      setIsLoading(true);
      await axios.put(`${API_BASE_URL}/students/comment/${student}`, {
        comment: commentText.comment,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      setError(null);
      setSucces("comment saved");
      SetConfirmSaveModel(false);
    } catch (error) {
      console.error("Error saving comment:", error);
      setError("Failed to save comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButtons = (student: Student) => {
    const commonButtons = (
      <>
        <button
          onClick={() => handleView(student)}
          className="text-indigo-600 font-extrabold hover:text-indigo-900 mr-3"
        >
          VIEW
        </button>
        {hasPermission(loggedUser as TeamMember, "students", "attend") ? (
          <button
            onClick={() => handleUpdateStudent(student)}
            className="text-green-600 font-extrabold hover:text-green-900 ml-3"
          >
            UPDATE
          </button>
        ) : (
          ""
        )}
        {hasPermission(loggedUser as TeamMember, "students", "delete") ? (
          <button
            onClick={() => {
              handleDeleteClick(student._id);
              setAction("delete student");
            }}
            className="text-red-600 ml-3 font-extrabold hover:text-red-900"
          >
            DELETE
          </button>
        ) : (
          ""
        )}
        {hasPermission(loggedUser as TeamMember, "students", "complete") ? (
          <button
            onClick={() => {
              handleStatusClick(student._id, student.name, "completed");
              setAction("complete student");
            }}
            className="text-green-600 font-extrabold hover:text-green-900 ml-3"
          >
            COMPLETE
          </button>
        ) : (
          ""
        )}
        {hasPermission(loggedUser as TeamMember, "students", "dropout") ? (
          <button
            onClick={() => {
              handleStatusClick(student._id, student.name, "droppedout");
              setAction("drop student out");
            }}
            className="text-green-600 font-extrabold hover:text-green-900 ml-3"
          >
            DROPOUT
          </button>
        ) : (
          ""
        )}
        {hasPermission(loggedUser as TeamMember, "students", "comment") ? (
          <div className="">
            <input
              className="p-1 bg-gray-200 border-  2  border-gray-500 rounded-md"
              type="text"
              placeholder="type comment..."
              defaultValue={student.comment}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <button
              onClick={() => {
                SetConfirmSaveModel(true);
                setStudent(student._id);
                setAction("save comment");
              }}
              className="text-blue-600 ml-3 font-extrabold hover:text-blue-900"
            >
              SAVE
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
                onClick={() => {
                  handleStatusClick(student._id, student.name, "accepted");
                  setAction("admit student");
                }}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                ADMIT
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "students", "update") ? (
              <button
                onClick={() => handleUpdateStudent(student)}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                UPDATE
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
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                UPDATE
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "students", "register") ? (
              <button
                onClick={() => {
                  setStudentToRegister({ id: student._id, name: student.name });
                  setIsPaymentModalOpen(true);
                }}
                className="text-blue-600 font-extrabold hover:text-blue-900 ml-3"
              >
                REGISTER
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
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                UPDATE
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
              <button
                onClick={() => handleViewP(student, "pay")}
                className="bg-green-700  text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                PAY
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
                onClick={() => {
                  handleStatusClick(student._id, student.name, "started");
                  setAction("activate student");
                }}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                ACTIVATE
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
            {hasPermission(loggedUser as TeamMember, "students", "update") ? (
              <button
                onClick={() => handleUpdateStudent(student)}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                UPDATE
              </button>
            ) : (
              ""
            )}
            {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
              <button
                onClick={() => handleViewP(student, "pay")}
                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
              >
                PAY
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
                onClick={() => {
                  SetConfirmAttendModel(true);
                  setAction("Attend Student");
                  setStudent(student._id);
                }}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                ATTEND
              </button>
            ) : (
              ""
            )}
          </>
        );
      case "droppedout":
        return (
          <>
            {commonButtons}
            {hasPermission(loggedUser as TeamMember, "students", "update") ? (
              <button
                onClick={() => {
                  handleStatusClick(student._id, student.name, "started");
                  setAction("reactivate student");
                }}
                className="text-green-600 font-extrabold hover:text-green-900 ml-3"
              >
                REACTIVATE
              </button>
            ) : (
              ""
            )}
          </>
        );
      case "completed":
        return(
          <>
          {hasPermission(loggedUser as TeamMember, "students", "dropout") ? (
            <button
              onClick={() => {
                handleStatusClick(student._id, student.name, "droppedout");
                setAction("drop student out");
              }}
              className="text-green-600 font-extrabold hover:text-green-900 ml-3"
            >
              DROPOUT
            </button>
          ) : (
            ""
          )}``
        </>

        )
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
            STUDENTS
          </h2>
          {hasPermission(loggedUser as TeamMember, "students", "sms") && (
            <button
              onClick={() => setOpenMessage(true)}
              className=" mx-auto text-blue-800 cursor-pointer"
            >
              <FaCommentSms size={50} />
            </button>
          )}
          {hasPermission(loggedUser as TeamMember, "students", "register") && (
            <a
              href="/students/register-new"
              className="px-4 py-2 bg-green-400 hover:bg-green-700 rounded-lg text-white font-bold"
            >
              REGISTER NEW
            </a>
          )}
          {hasPermission(loggedUser as TeamMember, "students", "register") && (
            <a
              href="/past-student"
              className="px-4 mx-10 py-2 bg-blue-400 hover:bg-blue-700 rounded-lg text-white font-bold"
            >
              PAST-STUDENT
            </a>
          )}
        </div>
        {error ||
          (succes && (
            <p
              className={`${error ? " text-red-600" : "text-green-500"
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
                "droppedout",
                "completed",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    filterStudents(status, refererFilter);
                    setStatus(status);
                  }}
                  className={`px-3 py-1 flex gap-1  text-xs sm:text-sm font-extrabold text-white   border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${activeFilter === status ? "bg-green-20" : ""
                    } ${status === "pending"
                      ? "bg-yellow-600"
                      : status === "accepted"
                        ? "bg-blue-600"
                        : status === "droppedout"
                          ? "bg-red-600"
                          : status === "registered"
                            ? "bg-green-400"
                            : status === "started"
                              ? "bg-green-500"
                              : "bg-green-900"
                    }`}
                >
                  <p className="pt-3 text-md ">
                    {status === "pending"
                      ? `CANDIDATES  `
                      : status === "accepted"
                        ? `ADMITTED `
                        : status === "droppedout"
                          ? `DROPOUT`
                          : status === "started"
                            ? `ACTIVE `
                            : `${status.toUpperCase()}`}
                  </p>
                  <p
                    className={`items-start   bg-white rounded-full p-1 font-extrabold ${status === "pending"
                      ? "text-yellow-600"
                      : status === "accepted"
                        ? "text-blue-600"
                        : status === "droppedout"
                          ? "text-red-600"
                          : status === "registered"
                            ? "text-green-400"
                            : status === "started"
                              ? "text-green-500"
                              : "text-green-900"
                      }`}
                  >
                    {studentCounts[status] || 0}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <label
                htmlFor="refererFilter"
                className="font-medium text-gray-700"
              >
                Filter by Referer:
              </label>
              <select
                id="refererFilter"
                value={refererFilter}
                onChange={(e) => filterStudents(activeFilter, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="default">Default</option>
                <option value="cyd">CYD</option>
              </select>
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
                INTAKE: {intake.toUpperCase()}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mx-14 lg:mx-0 ">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {" "}
                        <input
                          type="checkbox"
                          checked={areAllSelected()}
                          onChange={handleSelectAllChange}
                        />
                      </th>
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
                      {status !== "pending" ? (
                        <>
                          <th
                            scope="col"
                            className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                          >
                            Shifft
                          </th>
                        </>
                      ) : (
                        ""
                      )}
                      {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
                        <th
                          scope="col"
                          className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                        >
                          Payment Status
                        </th>
                      ) : ("")}
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
                          <input
                            type="checkbox"
                            value={student.phone}
                            checked={selectedValues.includes(student.phone)}
                            onChange={handleCheckboxChange}
                          />
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">
                            {student.phone}
                          </div>
                        </td>
                        {status !== "pending" ? (
                          <>
                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-sm text-gray-900">
                                {student.selectedShift?.start} {"-"} {student.selectedShift?.end}
                              </div>
                            </td>
                          </>
                        ) : (
                          ""
                        )}
                        {hasPermission(loggedUser as TeamMember, "payment", "pay") ? (
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
                        ) : (
                          ""
                        )}
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
                    UPADATE STUDENT INFO
                  </h3>
                  <div className="mt-4 space-y-2">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-700">
                        SELECT COURSE
                      </label>
                      <select
                        value={selectedStudent.selectedCourse}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            selectedCourse : e.target.value ,

                            selectedShift:
                              courses.find((c) => c._id === e.target.value)
                                ?.shifts[0] || selectedStudent.selectedShift,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {courses.map((course) => (
                          <option key={course.title} value={course._id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        NAME
                      </label>
                      <input
                        type="text"
                        value={selectedStudent.name}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            name: e.target.value,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SELECT SHIFT
                      </label>
                      <select
                        value={selectedStudent.selectedShift?._id}
                        onChange={(e) =>
                          setSelectedStudent({
                            ...selectedStudent,
                            selectedShift: courses.find((c) => c._id === selectedStudent.selectedCourse)?.shifts.find((s) => s._id === e.target.value) || selectedStudent.selectedShift,
                          })
                        }
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {courses
                          .find(
                            (course) =>
                              course._id === selectedStudent.selectedCourse
                          )
                          ?.shifts?.map((shift) => (
                            <option key={shift._id} value={shift._id}>
                              {shift.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        SELECT INTAKE
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
                  <h3 className="text-lg font-extrabold text-center text-gray-900">
                    STUDENT DETAILS
                  </h3>
                  <div className="mt-4 space-y-2">
                    <p className="flex">
                      <span className="font-extrabold w-28">NAME</span>{" "}
                      <span> {selectedStudent.name} </span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold  w-28 ">EMAIL</span>{" "}
                      <span> {selectedStudent.email}</span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold w-28 ">PHONE</span>{" "}
                      <span> {selectedStudent.phone}</span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold w-28 ">INTAKE</span>{" "}
                      <span>{selectedStudent.intake}</span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold w-28 ">COURSE</span>{" "}
                      {/* @ts-expect-error error */}
                      <span>{selectedStudent?.selectedCourse.title}</span>
                    </p>

                    <p className="flex">
                      <span className="font-extrabold w-28 ">SHIFT</span>{" "}
                      <span> {selectedStudent.selectedShift?.name}</span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold w-28 ">APPLIED</span>{" "}
                      <span>{formatDate(selectedStudent.createdAt)}</span>
                    </p>
                    <p className="flex">
                      <span className="font-extrabold w-28 ">STATUS</span>{" "}
                      <span>
                        {" "}
                        <span> {selectedStudent.status}</span>
                      </span>
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
                            <p className="flex items-center">
                              <span className="font-extrabold w-28 ">
                                STATUS
                              </span>{" "}
                              <span
                                className={`${filteredPayment.status === "unpaid"
                                  ? "bg-red-600"
                                  : filteredPayment.status === "partial"
                                    ? "bg-red-400"
                                    : filteredPayment.status === "paid"
                                      ? "bg-blue-700"
                                      : "bg-green-600"
                                  } font-extrabold  text-white p-1 rounded-md`}
                              >
                                {filteredPayment.status.toUpperCase()}
                              </span>
                            </p>
                            <p className="flex mt-1 ">
                              <span className="font-extrabold w-28 ">
                                TO PAY
                              </span>{" "}
                              <span className=" text-green-600 font-extrabold ">
                                {new Intl.NumberFormat().format(
                                  filteredPayment.amountDue
                                )}{" "}
                                Frw
                              </span>
                            </p>
                            <p className="flex mt-1">
                              <span className="font-extrabold w-28 ">PAID</span>{" "}
                              <span className=" text-blue-600 font-extrabold ">
                                {new Intl.NumberFormat().format(
                                  filteredPayment.amountPaid
                                )}{" "}
                                Frw
                              </span>
                            </p>
                            <p className="flex mt-1">
                              <span className="font-extrabold w-28  ">
                                REMAINING
                              </span>{" "}
                              <span className=" text-red-600 font-extrabold ">
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
                    <p className="flex flex-col">
                      <span className="font-extrabold w-28">Message</span>{" "}
                      <p> {selectedStudent.message}</p>
                    </p>
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
                    handleStatusClick(
                      studentToRegister.id,
                      studentToRegister.name,
                      "registered"
                    );
                    setAction("register student");
                  }

                  setIsPaymentModalOpen(false);
                }}
                disabled={!paymentMethod}
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md ${!paymentMethod
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
                  ? "PAY SCHOOL FEES"
                  : type === "discount"
                    ? "ADD DISCOUNT"
                    : "ADD EXTRA"}
              </h3>
              <div className="mt-4 flex  flex-col gap-5">
                <span className="flex gap-10 items-center justify-between mx-10 mb-3">
                  <label className="font-extrabold" htmlFor="amount">
                    AMOUNT:
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
                  <span className="flex gap-10 items-center mx-10 justify-between mb-3">
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
            <div className="bg-gray-50 p-4 flex justify-between  mx-5">
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
      {isOpenMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              SEND MESSAGE TO{" "}
              <p className="font-extrabold inline text-blue-500">
                {" "}
                {selectedValues.length}{" "}
              </p>{" "}
              PEOPLE
            </h3>
            <p className="text-end  test-sm text-blue-500"> {char} left</p>
            <textarea
              className="w-full p-2 border rounded-lg mb-4"
              rows={4}
              maxLength={145}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                Setchar(145 - e.target.value.length);
              }}
              placeholder="Type your message here..."
            ></textarea>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={closePopup}
              >
                Cancel
              </button>
              <button
                className={`${isloading ? "cursor-progress" : ""
                  } px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"`}
                onClick={handleSend}
              >
                {isloading ? " Sending..." : " Send"}
              </button>
            </div>
            <p
              className={`${error ? "text-red-500" : "text-green-600"
                } font-bold text-xl animate-pulse text-center`}
            >
              {error || succes}
            </p>
          </div>
        </div>
      )}
      {confirmModelOpen && (
        <ConfirmDeleteModal
          onConfirm={() => handleDelete(item as string)}
          onClose={() => SetConfirmModel(false)}
          loading={isloading}
          action={action}
        />
      )}
      {confirmStatusModelOpen && (
        <ConfirmDeleteModal
          onConfirm={() =>
            handleStatusChange(
              items.itemId,
              items.name,
              items.status,
              loggedUser?.name as string
            )
          }
          onClose={() => SetConfirmStatusModel(false)}
          loading={isloading}
          action={action}
        />
      )}
      {confirmSaveModelOpen && student && (
        <ConfirmDeleteModal
          onConfirm={() => handleSaveComment(student)}
          onClose={() => SetConfirmSaveModel(false)}
          loading={isloading}
          action={action}
        />
      )}
      {confirmAttendModelOpen && student && (
        <ConfirmDeleteModal
          onConfirm={() => handleAttend(student)}
          onClose={() => SetConfirmAttendModel(false)}
          loading={isloading}
          action={action}
        />
      )}
    </div>
  );
};

export default withAdminAuth(StudentManagement);

