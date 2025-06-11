"use client";
import ConfirmDeleteModal from "@/components/confirmPopupmodel";
import Loader from "@/components/loader";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/libs/dateConverter";
import { hasPermission } from "@/libs/hasPermission"; import { TeamMember } from "@/types/types";
;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

interface Student {
  _id: string;
  nid: string
  name: string;
  image: string
  email: string;
  phone: string;
  intake: string;
  secondPhone: string
  location: string,
  gender: string,
  identity: string,
  dob: string,
  nationality: string
  selectedCourse: { title: string; _id: string }
  message: string;
  selectedShift: { _id: string; name: string; start: string; end: string };
  updatedAt: string;
  createdAt: string;
  status: string;
  admitted: string
  registered: string
  comment: string;
}

interface Payment {
  _id: string;
  method: string,
  receiver: string
  studentId: Student | null;
  amount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentsPage: React.FC = () => {
  const [confirmModelOpen, SetConfirmModel] = useState(false);
  const [action, setAction] = useState("");
  const [openView, setOpenView] = useState(false);

  const [loading, setIsLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fetching, setIsFetching] = useState<boolean>(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();
  const handleView = (student: Student) => {
    setOpenView(true);
    setSelectedStudent(student);
  };
  const handleDisableView = () => {
    setOpenView(false);
    setSelectedStudent(null);
  };
  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment/transaction`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      });
      await fetchLoggedUser();

      if (!response) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setPayments(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchPayments();
  }, []);
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await axios.delete(
        `${API_BASE_URL}/payment/transaction/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      }
      );
      toast.success(response.data.message);
      await fetchPayments();
    } catch (error) {
      toast.error("failed to delete data");
      throw error
    }
    finally {
      SetConfirmModel(false);
      setIsLoading(false)
    }
  };
  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    SetConfirmModel(true);
  };
  const filteredPayments = payments
    .filter(
      (payment) =>
        payment.studentId?.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.reason.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (fetching) {
    return (
      <div className="text-center mt-20">
        <SideBar />
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500">
        <SideBar />
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <SideBar />

      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold p-6 text-gray-900 text-center border-b">
          TRANSACTIONS
        </h2>
        <div className="p-4">
          <input
            type="text"
            placeholder="Search by Student Name or Reason"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 mb-4 w-full"
          />
          <div className="overflow-x-auto">
            {hasPermission(loggedUser as TeamMember, "payment", "view") ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment, index) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.studentId ? payment.studentId.name : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Intl.NumberFormat().format(payment.amount)} Frw
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.reason || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment?.method || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment?.receiver|| "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2 items-center">
                        <div className="text-sm text-red-700 font-extrabold hover:text-red-900">
                          {hasPermission(
                            loggedUser as TeamMember,
                            "transaction",
                            "delete"
                          ) ? (
                            <button
                              onClick={() => {
                                handleDeleteClick(payment._id);
                                setAction("delete transaction");
                              }}
                            >
                              delete
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="text-sm text-green-700 font-extrabold hover:text-green-900">
                          {hasPermission(
                            loggedUser as TeamMember,
                            "payment",
                            "view"
                          ) ? (
                            <button
                              onClick={() => handleView(payment.studentId)}
                            >
                              View
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">
                you dont`&apos;t have permission to view this
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmModelOpen && (
        <ConfirmDeleteModal
          onConfirm={() => handleDelete(itemToDelete as string)}
          onClose={() => SetConfirmModel(false)}
          action={action}
          loading={loading}
        />
      )}
      {selectedStudent && openView && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:max-w-lg ">
            <div className="bg-gray-50 p-6 h-96 overflow-scroll">
              <div className="flex gap-10 items-center">
                {selectedStudent.image ? <img src={selectedStudent.image} alt="passport" className="w-24 rounded-full" /> : <FaUser className="w-24" />}
                <h3 className="text-lg font-extrabold text-center text-gray-900">
                  STUDENT DETAILS
                </h3>

              </div>
              <div className="mt-4 space-y-4">
                <p className="flex gap-10">
                  <span className="font-extrabold w-28">Name</span>{" "}
                  <span> {selectedStudent.name} </span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold  w-28 ">Email</span>{" "}
                  <span> {selectedStudent.email}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Phone 1</span>{" "}
                  <span> {selectedStudent.phone} </span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Phone 2</span>{" "}
                  <span> {selectedStudent.secondPhone} </span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Intake</span>{" "}
                  <span>{selectedStudent.intake}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Course</span>{" "}
                  <span>{selectedStudent?.selectedCourse.title}</span>
                </p>

                <p className="flex  gap-10">
                  <span className="font-extrabold w-28 ">Shift</span>{" "}
                  <span> {selectedStudent.selectedShift?.name}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Nationality</span>{" "}
                  <span> {selectedStudent?.nationality}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Address</span>{" "}
                  <span> {selectedStudent?.location}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Gender</span>{" "}
                  <span> {selectedStudent?.gender}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">D.O.B</span>{" "}
                  <span>{selectedStudent?.dob}</span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28  ">NID/ Passport</span>{" "}
                  <p className=""> {selectedStudent.nid}</p>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Applied</span>{" "}
                  <span>{formatDate(new Date(selectedStudent.createdAt))}</span>
                </p>

                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Status</span>{" "}
                  <span>
                    {" "}
                    <span> {selectedStudent.status}</span>
                  </span>
                </p>
                <p className="flex gap-10">
                  <span className="font-extrabold w-28 ">Admitted </span>{" "}
                  <span>

                    <span> {selectedStudent?.admitted ? formatDate(new Date(selectedStudent?.admitted)) : 'no record found'}</span>
                  </span>
                </p>
                <p className="flex gap-10 ">
                  <span className="font-extrabold w-28 ">Registered </span>{" "}
                  <span>

                    <span> {selectedStudent?.registered ? formatDate(new Date(selectedStudent?.registered)) : 'no record found'}</span>
                  </span>
                </p>

                <p className="flex flex-col mt-10 gap-10">
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
  );
};

export default withAdminAuth(PaymentsPage);
