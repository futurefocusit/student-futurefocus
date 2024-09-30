"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "@/config/baseURL";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { fetchUser, getLoggedUserData } from "@/context/adminAuth";
import { IUser } from "@/types/types";
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
}
interface Payment {
  studentId: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  amountDiscounted: number;
  extraAmount: number;
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
  const [type ,setType] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>("registered");
  const [searchTerm, setSearchTerm] = useState<string>("");
 const [userData, setUserData] = useState<IUser>();

  const [formData, setFormData] = useState({
    amount: "",
  });

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>(`${API_BASE_URL}/students`);
        await fetchUser();
        setUserData(await getLoggedUserData());
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

  const handleView = (student: Student,type:string) => {
    setSelectedStudent(student);
    setType(type)
  };

  const handlePay = async (id: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payment/pay/${id}`,
        formData
      );
      toast.success(response.data.message);
      fetchPayment();
    } catch (error) {
      setError("Error happened! check payment and try again");
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/payment/${id}`);
      toast.success(response.data.message);
      await fetchPayment();
    } catch (error) {
      toast.error("failed to delete data");
      //@ts-expect-error error
      throw new Error(error);
    }
  };
  const handleDiscount = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/payment/discount/${id}`,
        formData
      );
      toast.success(response.data.message);
      fetchPayment();
    } catch (error) {
      setError("Error happened! check payment and try again");
    }
  };
  const handleExtra = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/payment/extra/${id}`,
        formData
      );
      toast.success(response.data.message);
      fetchPayment();
    } catch (error) {
      setError("Error happened! check payment and try again");
    }
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

  const calculateTotals = (intakeStudents: Student[]) => {
    let totalPaid = 0;
    let totalDiscounted = 0;
    let totalExtras = 0;
    let totalDue = 0;

    intakeStudents.forEach((student) => {
      const paymentInfo = payment.find((p) => p.studentId === student._id);
      if (paymentInfo) {
        totalPaid += paymentInfo.amountPaid;
        totalDiscounted += paymentInfo.amountDiscounted;
        totalExtras += paymentInfo.extraAmount;
        totalDue += paymentInfo.amountDue;
      }
    });

    return {
      totalPaid,
      totalDiscounted,
      totalExtras,
      totalDue,
      remaining: totalDue - totalPaid,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <SideBar />

      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-50 flex justify-between shadow-md rounded-lg px-2 items-center">
          <h2 className="text-2xl font-bold p-6 text-gray-900 text-center border-b">
            Student Payment
          </h2>
          {hasPermission(userData as IUser, "students", "register") ? (
            <a
              href="/students/register-new"
              className="p-2 bg-green-400 hover:bg-green-700 rounded-lg px-5 text-white font-bold"
            >
              New
            </a>
          ) : (
            ""
          )}
        </div>
        {error && <p className="text-red-600 p-4 text-center">{error}</p>}

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto">
              {["registered", "started", "completed", "droppedout"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => filterStudents(status)}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      activeFilter === status ? "bg-indigo-100" : ""
                    }`}
                  >
                    {status}
                  </button>
                )
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

          {Object.entries(groupedStudents).map(([intake, intakeStudents]) => {
            const {
              totalPaid,
              totalDue,
              remaining,
              totalDiscounted,
              totalExtras,
            } = calculateTotals(intakeStudents);

            return (
              <div key={intake} className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Intake: {intake}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Amount To Pay
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Amount Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Amount Discounted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Extra mount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Remaining
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {intakeStudents.map((student, index) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">
                              {payment
                                .filter((p) => p.studentId === student._id)
                                .map((p) => (
                                  <div key={p._id}>
                                    {new Intl.NumberFormat().format(
                                      p.amountDue
                                    )}{" "}
                                    Frw
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">
                              {payment
                                .filter((p) => p.studentId === student._id)
                                .map((p) => (
                                  <div key={p._id}>
                                    {new Intl.NumberFormat().format(
                                      p.amountPaid
                                    )}{" "}
                                    Frw
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">
                              {payment
                                .filter((p) => p.studentId === student._id)
                                .map((p) => (
                                  <div key={p._id}>
                                    {new Intl.NumberFormat().format(
                                      p.amountDiscounted
                                    )}{" "}
                                    Frw
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-900">
                              {payment
                                .filter((p) => p.studentId === student._id)
                                .map((p) => (
                                  <div key={p._id}>
                                    {new Intl.NumberFormat().format(
                                      p.extraAmount
                                    )}{" "}
                                    Frw
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            {payment
                              .filter((p) => p.studentId === student._id)
                              .map((p) => (
                                <div key={p._id}>
                                  {new Intl.NumberFormat().format(
                                    p.amountDue - p.amountPaid
                                  )}{" "}
                                  Frw
                                </div>
                              ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap gap-1 flex text-sm font-medium">
                            {hasPermission(
                              userData as IUser,
                              "payment",
                              "pay"
                            ) ? (
                              <button
                                onClick={() => handleView(student, "pay")}
                                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
                              >
                                Pay
                              </button>
                            ) : (
                              ""
                            )}
                            {hasPermission(
                              userData as IUser,
                              "payment",
                              "discount"
                            ) ? (
                              <button
                                onClick={() => handleView(student, "discount")}
                                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
                              >
                                -
                              </button>
                            ) : (
                              ""
                            )}
                            {hasPermission(
                              userData as IUser,
                              "payment",
                              "add-extra"
                            ) ? (
                              <button
                                onClick={() => handleView(student, "extra")}
                                className="bg-green-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-green-900"
                              >
                                +
                              </button>
                            ) : (
                              ""
                            )}
                            {hasPermission(
                              userData as IUser,
                              "payment",
                              "delete"
                            ) ? (
                              <button
                                onClick={() => handleDelete(student._id)}
                                className="bg-red-700 text-white font-extrabold px-5 py-2 rounded-md hover:bg-red-900"
                              >
                                delete
                              </button>
                            ):""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="px-6 py-4 font-bold" colSpan={2}>
                          Totals:
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {new Intl.NumberFormat().format(totalDue)} Frw
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {new Intl.NumberFormat().format(totalPaid)} Frw
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {new Intl.NumberFormat().format(totalDiscounted)} Frw
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {new Intl.NumberFormat().format(totalExtras)} Frw
                        </td>
                        <td className="px-6 py-4 font-bold">
                          {new Intl.NumberFormat().format(remaining)} Frw
                        </td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            );
          })}

          {selectedStudent && type && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg">
                <div className="bg-gray-50 h-32 overflow-scroll">
                  <h3 className="text-lg text-center bg-blue-600 text-white font-extrabold">
                    {type === "pay"
                      ? "Pay School Fees"
                      : type === "discount"
                      ? "Add Discount"
                      : "Add Extra"}
                  </h3>
                  <div className="mt-4 flex flex-col gap-5">
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
                      ? "Pay"
                      : type === "discount"
                      ? "Add Discount"
                      : "Add Extra"}
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 text-sm text-black font-extrabold hover:text-white bg-red-300 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
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
