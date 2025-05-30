"use client"
import API_BASE_URL from "@/config/baseURL"
import axios from "axios"

import type React from "react"
import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "react-toastify"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import SideBar from "@/components/SideBar"
import { hasPermission } from "@/libs/hasPermission"
import Loader from "@/components/loader"
import { useAuth } from "@/context/AuthContext"
import type { TeamMember } from "@/types/types"
import { FaRightFromBracket, FaRightToBracket, FaScaleBalanced } from "react-icons/fa6"
import withAdminAuth from "@/components/withAdminAuth"
import ConfirmDeleteModal from "@/components/confirmPopupmodel"

export interface CashflowType {
  type: string
  _id: string
  user: string
  amount: number
  reason: string
  payment: string
  createdAt: string
}

const PaymentsPage: React.FC = () => {
  const [confirmModelOpen, SetConfirmModel] = useState(false)
  const [action, setAction] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [cashflows, setCashflows] = useState<CashflowType[]>([])
  const [fetching, setIsFetching] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"income" | "expenses">("income")
  const [showModal, setShowModal] = useState<boolean>(false)
  const { fetchLoggedUser, loggedUser } = useAuth()

  // Simplified search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"user" | "payment" | "reason" | "all">("all")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    user: loggedUser?.name,
    reason: "",
    type: "",
    payment: "",
    amount: "",
  })
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([new Date(), null])

  // Memoized today's summary calculation
  const todaySummary = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTransactions = cashflows.filter((cashflow) => {
      const createdAt = new Date(cashflow.createdAt)
      createdAt.setHours(0, 0, 0, 0)
      return createdAt.getTime() === today.getTime()
    })

    let income = 0
    let expenses = 0

    todayTransactions.forEach((cashflow) => {
      if (cashflow.type === "income") {
        income += cashflow.amount
      } else if (cashflow.type === "expenses") {
        expenses += cashflow.amount
      }
    })

    return {
      income,
      expenses,
      difference: income - expenses,
    }
  }, [cashflows])

  const fetchCashflows = useCallback(async () => {
    try {
      await fetchLoggedUser()
      const response = await axios.get(`${API_BASE_URL}/cashflow`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })
      if (!response) {
        throw new Error("Network response was not ok")
      }
      const data = await response.data
      setCashflows(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsFetching(false)
    }
  }, [fetchLoggedUser])

  useEffect(() => {
    fetchCashflows()
  }, [fetchCashflows])

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Optimized search function
  const searchMatches = useCallback((cashflow: CashflowType, query: string, field: string) => {
    if (!query.trim()) return true

    const searchTerm = query.toLowerCase()

    switch (field) {
      case "user":
        return (cashflow.user || "").toLowerCase().includes(searchTerm)
      case "reason":
        return (cashflow.reason || "").toLowerCase().includes(searchTerm)
      case "payment":
        return (cashflow.payment || "").toLowerCase().includes(searchTerm)
      case "all":
        return (
          (cashflow.user || "").toLowerCase().includes(searchTerm) ||
          (cashflow.reason || "").toLowerCase().includes(searchTerm) ||
          (cashflow.payment || "").toLowerCase().includes(searchTerm)
        )
      default:
        return true
    }
  }, [])

  // Memoized filtered cashflows
  const filteredCashflows = useMemo(() => {
    const startDate = selectedDates[0]
      ? new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1)
      : new Date(0)
    const endDate = selectedDates[1]
      ? new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth() + 1, 0)
      : new Date()

    return cashflows
      .filter((cashflow) => {
        const cashflowDate = new Date(cashflow.createdAt)
        const matchesDate = cashflowDate >= startDate && cashflowDate <= endDate
        const matchesType = cashflow.type === filter
        const matchesSearch = searchMatches(cashflow, debouncedSearchQuery, searchField)

        return matchesDate && matchesType && matchesSearch
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [cashflows, selectedDates, filter, debouncedSearchQuery, searchField, searchMatches])

  // Simplified highlight function
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    const highlighted = text.replace(regex, '<mark style="background-color: yellow;">$1</mark>')

    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }, [])

  // Simplified grouping function
  const groupedCashflows = useMemo(() => {
    const groups: Record<string, { total: number; transactions: CashflowType[] }> = {}

    filteredCashflows.forEach((cashflow) => {
      const date = new Date(cashflow.createdAt)
      const dateString = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[dateString]) {
        groups[dateString] = {
          total: 0,
          transactions: [],
        }
      }

      groups[dateString].total += cashflow.amount
      groups[dateString].transactions.push(cashflow)
    })

    return groups
  }, [filteredCashflows])

  const handleDeleteClick = useCallback((itemId: string) => {
    setItemToDelete(itemId)
    SetConfirmModel(true)
  }, [])

  const handleFormData = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    try {
      const submitData = { ...formData, user: loggedUser?.name }
      const response = await axios.post(`${API_BASE_URL}/cashflow`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })
      fetchCashflows()
      toast.success(response.data.message)
      setShowModal(false)
      setFormData({ user: loggedUser?.name, reason: "", type: "", payment: "", amount: "" })
    } catch (error) {
      console.log(error)
      toast.error("Failed to add transaction")
    }
  }, [formData, loggedUser?.name, fetchCashflows])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true)
        const response = await axios.delete(`${API_BASE_URL}/cashflow/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
          },
        })
        toast.success(response.data.message)
        await fetchCashflows()
      } catch (error) {
        toast.error("failed to delete data")
      } finally {
        SetConfirmModel(false)
        setIsLoading(false)
      }
    },
    [fetchCashflows],
  )

  if (fetching) {
    return (
      <div className="text-center mt-20">
        <SideBar />
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500">
        <SideBar />
        Error: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <SideBar />
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex gap-72">
          <h1 className="lg:text-left ml-7">TODAY SUMMARY</h1>
          <h2 className="text-2xl font-bold text-gray-900 text-center">CASHFLOW</h2>
        </div>

        {hasPermission(loggedUser as TeamMember, "cashflow", "view") && (
          <div className="flex flex-col lg:flex-row justify-center w-1/4 gap-5">
            <div className="flex flex-col gap-2 items-center lg:justify-start">
              <FaRightToBracket size={40} className="text-green-500" />
              <p className="text-lg font-extrabold text-green-500">{todaySummary.income.toLocaleString()} Frw</p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <FaRightFromBracket rotate={45} size={40} className="text-red-500 rotate-180" />
              <p className="text-lg font-extrabold text-red-500">{todaySummary.expenses.toLocaleString()} Frw</p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <FaScaleBalanced size={40} className="text-gray-600" />
              <p className="text-lg font-extrabold text-gray-500">{todaySummary.difference.toLocaleString()} Frw</p>
            </div>
          </div>
        )}

        <div className="flex justify-around p-4 flex-wrap gap-4">
          <DatePicker
            selected={selectedDates[0]}
            onChange={(dates) => setSelectedDates(dates as [Date | null, Date | null])}
            startDate={selectedDates[0]}
            endDate={selectedDates[1]}
            selectsRange
            showMonthYearPicker
            dateFormat="MMMM yyyy"
            className="border-2 rounded hover:cursor-pointer px-3"
          />

          <div className="flex gap-2">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as "user" | "payment" | "reason" | "all")}
              className="border-2 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">🔍 Search All Fields</option>
              <option value="user">👤 Search by User Name</option>
              <option value="payment">💳 Search by Payment Method</option>
              <option value="reason">📝 Search by Reason</option>
            </select>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="border-2 rounded px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div>
            <button
              onClick={() => setFilter("income")}
              className={`px-4 py-2 font-semibold ${
                filter === "income" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              } rounded-l`}
            >
              CASH IN
            </button>
            <button
              onClick={() => setFilter("expenses")}
              className={`px-4 py-2 font-semibold ${
                filter === "expenses" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
              } rounded-r`}
            >
              CASH OUT
            </button>
          </div>

          {hasPermission(loggedUser as TeamMember, "cashflow", "add") && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-500 text-white font-semibold rounded"
            >
              ADD TRANSACTION
            </button>
          )}
        </div>

        <div className="p-4">
          {hasPermission(loggedUser as TeamMember, "cashflow", "view") ? (
            <div className="overflow-x-auto">
              {debouncedSearchQuery && filteredCashflows.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm mb-4">
                  <div className="font-medium text-green-800">
                    Found {filteredCashflows.length} transaction{filteredCashflows.length !== 1 ? "s" : ""} matching "
                    {debouncedSearchQuery}"
                  </div>
                </div>
              )}

              {Object.entries(groupedCashflows).length === 0 && debouncedSearchQuery && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-gray-500 text-lg mb-2">No transactions found</div>
                  <div className="text-gray-400 text-sm">
                    No transactions match your search for "{debouncedSearchQuery}"
                  </div>
                </div>
              )}

              {Object.entries(groupedCashflows).map(([date, { total, transactions }]) => (
                <div key={date} className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{date.toUpperCase()}</h3>
                  <div className="text-sm text-gray-600 mb-2">Total: {new Intl.NumberFormat().format(total)} Frw</div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((cashflow, index) => (
                        <tr key={cashflow._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {debouncedSearchQuery && (searchField === "user" || searchField === "all")
                              ? highlightText(cashflow.user || "N/A", debouncedSearchQuery)
                              : cashflow.user || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {new Intl.NumberFormat().format(cashflow.amount)} Frw
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {debouncedSearchQuery && (searchField === "payment" || searchField === "all")
                              ? highlightText(cashflow.payment, debouncedSearchQuery)
                              : cashflow.payment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {debouncedSearchQuery && (searchField === "reason" || searchField === "all")
                              ? highlightText(cashflow.reason || "N/A", debouncedSearchQuery)
                              : cashflow.reason || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(cashflow.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasPermission(loggedUser as TeamMember, "cashflow", "delete") && (
                              <button
                                onClick={() => {
                                  handleDeleteClick(cashflow._id)
                                  setAction(`delete ${cashflow.type} transaction`)
                                }}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">You don't have permission to view this</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">ADD NEW TRANSACTION</h2>
            <div className="space-y-4">
              <select
                onChange={handleFormData}
                className="w-full border-2 rounded px-3 py-2"
                name="type"
                value={formData.type}
              >
                <option value="">Select type</option>
                <option value="income">Cash In</option>
                <option value="expenses">Cash Out</option>
              </select>
              <input
                name="amount"
                value={formData.amount}
                onChange={handleFormData}
                placeholder="Amount"
                className="w-full border-2 rounded px-3 py-2"
                type="number"
              />
              <input
                name="reason"
                value={formData.reason}
                maxLength={50}
                onChange={handleFormData}
                placeholder="Reason"
                className="w-full border-2 rounded px-3 py-2"
                type="text"
              />
              <input
                name="payment"
                value={formData.payment}
                onChange={handleFormData}
                placeholder="Payment Method"
                className="w-full border-2 rounded px-3 py-2"
                type="text"
              />
            </div>
            <div className="flex justify-between mt-6">
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Submit
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModelOpen && (
        <ConfirmDeleteModal
          onConfirm={() => handleDelete(itemToDelete as string)}
          onClose={() => SetConfirmModel(false)}
          action={action}
          loading={isLoading}
        />
      )}
    </div>
  )
}

export default withAdminAuth(PaymentsPage)
