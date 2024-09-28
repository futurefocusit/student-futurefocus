"use client";
import API_BASE_URL from "@/config/baseURL";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SideBar from "@/components/SideBar";
import withAdminAuth from "@/components/withAdminAuth";
import { fetchUser } from "@/context/adminAuth";
import { Admin } from "@/context/AuthContext";
import { hasPermission } from "@/libs/hasPermission";
import { IUser } from "@/types/types";

export interface CashflowType {
  type: string;
  user: string;
  amount: number;
  reason: string;
  payment: string;
  createdAt: string;
}

const PaymentsPage: React.FC = () => {
  const [cashflows, setCashflows] = useState<CashflowType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"income" | "expenses">("income");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loggedUser, setLoggedUser]= useState<IUser>()
  const [formData, setFormData] = useState({
    user: loggedUser?.name,
    reason: "",
    type: "",
    payment: "",
    amount: "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const fetchCashflows = async () => {
    try {
        setLoggedUser(await fetchUser());
      const response = await axios.get(`${API_BASE_URL}/cashflow`);
      if (!response) {
        throw new Error("Network response was not ok");
      }
      const data = await response.data;
      setCashflows(data);
    } catch (error) {
      //@ts-expect-error ignore error
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashflows();
  }, []);

  const filteredCashflows = cashflows.filter((cashflow) => {
    const cashflowDate = new Date(cashflow.createdAt);
    return (
      cashflow.type === filter &&
      cashflowDate.getMonth() ===
        (selectedDate ? selectedDate.getMonth() : new Date().getMonth()) &&
      cashflowDate.getFullYear() ===
        (selectedDate ? selectedDate.getFullYear() : new Date().getFullYear())
    );
  });

  const handleFormData = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      formData.user =loggedUser?.name
      const response = await axios.post(`${API_BASE_URL}/cashflow`, formData);
      fetchCashflows();
      toast.success(response.data.message);
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const groupByDate = (data: CashflowType[]) => {
    return data.reduce((groups, cashflow) => {
      const date = new Date(cashflow.createdAt);
      const dateString = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[dateString]) {
        groups[dateString] = { total: 0, transactions: [] };
      }

      groups[dateString].total += cashflow.amount;
      groups[dateString].transactions.push(cashflow);

      return groups;
    }, {} as Record<string, { total: number; transactions: CashflowType[] }>);
  };

  const calculateMonthlyTotals = (data: CashflowType[]) => {
    return data.reduce((acc, cashflow) => {
      const date = new Date(cashflow.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += cashflow.amount;
      return acc;
    }, {} as Record<string, number>);
  };

  const groupedCashflows = groupByDate(filteredCashflows);
  const monthlyTotals = calculateMonthlyTotals(filteredCashflows);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <SideBar />
        Loading...
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
          Cash Flow
        </h2>

        <div className="flex justify-around p-4">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showMonthYearPicker
            dateFormat="MMMM yyyy"
            className="border-2 rounded hover:cursor-pointer px-3"
          />
          <div>
            <button
              onClick={() => setFilter("income")}
              className={`px-4 py-2 font-semibold ${
                filter === "income"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } rounded-l`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter("expenses")}
              className={`px-4 py-2 font-semibold ${
                filter === "expenses"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800"
              } rounded-r`}
            >
              Expenses
            </button>
          </div>
         { hasPermission(loggedUser as IUser, 'cashflow', 'add')?<button
            onClick={() => setShowModal(true)}
            className="ml-4 px-4 py-2 bg-green-500 text-white font-semibold rounded"
          >
            Add Transaction
          </button>:""}
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            {Object.entries(groupedCashflows).map(
              ([date, { total, transactions }]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{date}</h3>
                  <p className="text-sm text-gray-600">
                    Total for the day: {new Intl.NumberFormat().format(total)}{" "}
                    Frw
                  </p>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((cashflow, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cashflow.user || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Intl.NumberFormat().format(cashflow.amount)}{" "}
                              Frw
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {cashflow.reason || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(cashflow.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-800">
                Monthly Totals
              </h4>
              <ul>
                {Object.entries(monthlyTotals).map(([monthYear, total]) => (
                  <li key={monthYear} className="text-sm text-gray-600">
                    {monthYear}: {new Intl.NumberFormat().format(total)} Frw
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Transaction</h2>

            <div className="flex gap-5 flex-col">
              <select
                onChange={handleFormData}
                className="border-2 rounded px-3"
                name="type"
                id="type"
              >
                <option value="">Select type</option>
                <option value="income">Income</option>
                <option value="expenses">Expenses</option>
              </select>
              <input
                name="amount"
                onChange={handleFormData}
                placeholder="Amount"
                className="border-2 rounded px-3 "
                type="number"
              />
              <input
                name="reason"
                maxLength={50}
                onChange={handleFormData}
                placeholder="Reason"
                className="border-2 rounded px-3 "
                type="text"
              />
              <input
                name="payment"
                onChange={handleFormData}
                placeholder="Payment Method"
                className="border-2 rounded px-3 "
                type="text"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
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
