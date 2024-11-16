"use client";
import Loader from "@/components/loader";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import API_BASE_URL from "@/config/baseURL";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/libs/hasPermission";import { TeamMember } from "@/types/types";
;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
  __v: number;
}

interface Payment {
  _id: string;
  studentId: Student | null;
  amount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { fetchLoggedUser, loggedUser } = useAuth();
  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payment/transaction`);
        await fetchLoggedUser();

      if (!response) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setPayments(data);
    } catch (error) {
      //@ts-expect-error error
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPayments();
  }, []);
  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/payment/transaction/${id}`
      );
      toast.success(response.data.message);
      await fetchPayments();
    } catch (error) {
      toast.error("failed to delete data");
      //@ts-expect-error error
      throw new Error(error);
    }
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

  if (loading) {
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

      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-700 hover:text-red-900">
                          {hasPermission(
                            loggedUser as TeamMember,
                            "transaction",
                            "delete"
                          ) ? (
                            <button onClick={() => handleDelete(payment._id)}>
                              delete
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
    </div>
  );
};

export default withAdminAuth(PaymentsPage);
