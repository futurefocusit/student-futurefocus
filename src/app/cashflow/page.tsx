"use client"
import API_BASE_URL from "@/config/baseURL"
import axios from "axios"

import type React from "react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import SideBar from "@/components/SideBar"
import withAdminAuth from "@/components/withAdminAuth"
import { hasPermission } from "@/libs/hasPermission"
import Loader from "@/components/loader"
import { useAuth } from "@/context/AuthContext"
import type { TeamMember } from "@/types/types"
import { FaRightFromBracket, FaRightToBracket, FaScaleBalanced } from "react-icons/fa6"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchField, setSearchField] = useState<"user" | "payment" | "reason">("user")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    user: loggedUser?.name,
    reason: "",
    type: "",
    payment: "",
    amount: "",
  })
  const [selectedDates, setSelectedDates] = useState<[Date | null, Date | null]>([new Date(), null])
  interface CashflowType {
    type: string // 'income' or 'expense'
    _id: string
    user: string
    amount: number
    reason: string
    payment: string
    createdAt: string // ISO string format date
  }

  const filterCashflowByDate = (cashflows: CashflowType[], targetDate: string) => {
    // Convert the target date to a Date object for comparison (ignoring time part)
    const targetDateObj = new Date(targetDate)
    targetDateObj.setHours(0, 0, 0, 0) // Reset the time to midnight

    // Filter cashflows based on the target date
    const filteredCashflows = cashflows.filter((cashflow) => {
      const createdAt = new Date(cashflow.createdAt)
      createdAt.setHours(0, 0, 0, 0) // Reset time to compare just the date part
      return createdAt.getTime() === targetDateObj.getTime()
    })

    // Initialize sums for income, expenses, and calculate the difference
    let income = 0
    let expenses = 0

    filteredCashflows.forEach((cashflow) => {
      if (cashflow.type === "income") {
        income += cashflow.amount
      } else if (cashflow.type === "expenses") {
        expenses += cashflow.amount
      }
    })

    const difference = income - expenses

    // Display or return the result
    return {
      income,
      expenses,
      difference,
    }
  }

  const timestamp = Date.now()
  const isoDate = new Date(timestamp).toISOString()

  const result = filterCashflowByDate(cashflows, isoDate)

  const fetchCashflows = async () => {
    try {
      await fetchLoggedUser()
      const response = await axios.get(`${API_BASE_URL}/cashflow`, {
        headers: {
          "Content-Type": 'applicatio/json',
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })
      if (!response) {
        throw new Error("Network response was not ok")
      }
      const data = await response.data
      setCashflows(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchCashflows()
  }, [])

  // Add debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredCashflows = cashflows
    .filter((cashflow) => {
      const cashflowDate = new Date(cashflow.createdAt)
      const startDate = selectedDates[0]
        ? new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1)
        : new Date(0)
      const endDate = selectedDates[1]
        ? new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth() + 1, 0)
        : new Date()

      const matchesDate = cashflowDate >= startDate && cashflowDate <= endDate
      const matchesType = cashflow.type === filter

      // Improved search functionality with better matching
      if (!debouncedSearchQuery) return matchesDate && matchesType

      const searchTerms = debouncedSearchQuery.toLowerCase().trim().split(/\s+/)
      const fieldValue = String(cashflow[searchField]).toLowerCase()

      // Check if all search terms are found in the field value
      const matchesSearch = cashflow[`${searchField}`].includes(searchQuery) 

      return matchesDate && matchesType && matchesSearch
    })
    .sort((a, b) => {
      // First sort by date (newest first)
      const dateComparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (dateComparison !== 0) return dateComparison

      // If same date, sort by time (newest first)
      return new Date(b.createdAt).getHours() - new Date(a.createdAt).getHours() ||
        new Date(b.createdAt).getMinutes() - new Date(a.createdAt).getMinutes()
    })

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId)
    SetConfirmModel(true)
  }

  const handleFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      formData.user = loggedUser?.name
      const response = await axios.post(`${API_BASE_URL}/cashflow`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })
      fetchCashflows()
      toast.success(response.data.message)
    } catch (error) {
      console.log(error)
      toast.error("Failed to add transaction")
    }
  }
  const handleDelete = async (id: string) => {
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
      throw error
    } finally {
      SetConfirmModel(false)
      setIsLoading(false)
    }
  }
  const groupByDate = (data: CashflowType[]) => {
    // First, group all transactions by date regardless of type
    const allTransactionsByDate = cashflows.reduce(
      (groups, cashflow) => {
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
            income: 0,
            expenses: 0,
            balance: 0,
            transactions: [],
          }
        }

        if (cashflow.type === "income") {
          groups[dateString].income += cashflow.amount
        } else if (cashflow.type === "expenses") {
          groups[dateString].expenses += cashflow.amount
        }

        groups[dateString].balance = groups[dateString].income - groups[dateString].expenses

        // Only add to transactions array if it matches the current filter
        if (cashflow.type === filter) {
          groups[dateString].total += cashflow.amount
          groups[dateString].transactions.push(cashflow)
        }

        return groups
      },
      {} as Record<
        string,
        {
          total: number
          income: number
          expenses: number
          balance: number
          transactions: CashflowType[]
        }
      >,
    )

    // Sort transactions within each date group by time (newest first)
    Object.keys(allTransactionsByDate).forEach(date => {
      allTransactionsByDate[date].transactions.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    })

    // Filter out dates with no transactions matching the current filter
    return Object.entries(allTransactionsByDate)
      .filter(([_, data]) => data.transactions.length > 0)
      .sort(([dateA], [dateB]) => {
        // Sort dates in descending order (newest first)
        return new Date(dateB).getTime() - new Date(dateA).getTime()
      })
      .reduce(
        (acc, [date, data]) => {
          acc[date] = data
          return acc
        },
        {} as Record<
          string,
          {
            total: number
            income: number
            expenses: number
            balance: number
            transactions: CashflowType[]
          }
        >,
      )
  }

  const calculateMonthlyTotals = (data: CashflowType[]) => {
    const startDate = selectedDates[0]
      ? new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1)
      : new Date(0)
    const endDate = selectedDates[1]
      ? new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth() + 1, 0)
      : new Date()

    return cashflows.reduce(
      (acc, cashflow) => {
        const date = new Date(cashflow.createdAt)
        if (date < startDate || date > endDate) return acc

        const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`

        if (!acc[monthYear]) {
          acc[monthYear] = {
            total: 0,
            income: 0,
            expenses: 0,
            balance: 0,
            hasFilteredTransactions: false,
          }
        }

        if (cashflow.type === "income") {
          acc[monthYear].income += cashflow.amount
        } else if (cashflow.type === "expenses") {
          acc[monthYear].expenses += cashflow.amount
        }

        acc[monthYear].balance = acc[monthYear].income - acc[monthYear].expenses

        if (cashflow.type === filter) {
          acc[monthYear].total += cashflow.amount
          acc[monthYear].hasFilteredTransactions = true
        }

        return acc
      },
      {} as Record<
        string,
        {
          total: number
          income: number
          expenses: number
          balance: number
          hasFilteredTransactions: boolean
        }
      >,
    )
  }

  const calculateAnnualTotals = (data: CashflowType[]) => {
    const startDate = selectedDates[0]
      ? new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), 1)
      : new Date(0)
    const endDate = selectedDates[1]
      ? new Date(selectedDates[1].getFullYear(), selectedDates[1].getMonth() + 1, 0)
      : new Date()

    return cashflows.reduce(
      (acc, cashflow) => {
        const date = new Date(cashflow.createdAt)
        if (date < startDate || date > endDate) return acc

        const year = date.getFullYear().toString()

        if (!acc[year]) {
          acc[year] = {
            total: 0,
            income: 0,
            expenses: 0,
            balance: 0,
            hasFilteredTransactions: false,
          }
        }

        if (cashflow.type === "income") {
          acc[year].income += cashflow.amount
        } else if (cashflow.type === "expenses") {
          acc[year].expenses += cashflow.amount
        }

        acc[year].balance = acc[year].income - acc[year].expenses

        if (cashflow.type === filter) {
          acc[year].total += cashflow.amount
          acc[year].hasFilteredTransactions = true
        }

        return acc
      },
      {} as Record<
        string,
        {
          total: number
          income: number
          expenses: number
          balance: number
          hasFilteredTransactions: boolean
        }
      >,
    )
  }

  const groupedCashflows = groupByDate(filteredCashflows)
  const monthlyTotals = calculateMonthlyTotals(filteredCashflows)
  const annualTotals = calculateAnnualTotals(filteredCashflows)

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
        <div className="flex gap-72 ">
          <h1 className="lg:text-left ml-7  ">TODAY SUMMARY</h1>

          <h2 className="text-2xl font-bold  text-gray-900 text-center ">CASHFLOW</h2>
        </div>
        {hasPermission(loggedUser as TeamMember, "cashflow", "view") ? (
          <div className=" flex  flex-col lg:flex-row justify-center w-1/4 gap-5">
            <div className=" flex  flex-col gap-2 items-center lg:justify-start">
              <FaRightToBracket size={40} className="text-green-500" />
              <p className="text-lg font-extrabold text-green-500">
                {" "}
                {result.income.toLocaleString()} {"Frw"}
              </p>
            </div>

            <div className=" flex  flex-col gap-2 items-center">
              <FaRightFromBracket rotate={45} size={40} className="text-red-500 rotate-180" />
              <p className="text-lg font-extrabold text-red-500">
                {" "}
                {result.expenses.toLocaleString()} {"Frw"}
              </p>
            </div>
            <div className=" flex  flex-col gap-2 items-center">
              <FaScaleBalanced size={40} className="text-gray-600" />
              <p className="text-lg font-extrabold text-gray-500">
                {" "}
                {result.difference.toLocaleString()} {"Frw"}
              </p>
            </div>
          </div>
        ) : (
          ""
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
              onChange={(e) => setSearchField(e.target.value as "user" | "payment" | "reason")}
              className="border-2 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="user">Search by User</option>
              <option value="payment">Search by Payment Method</option>
              <option value="reason">Search by Reason</option>
            </select>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchField}...`}
                className="border-2 rounded px-3 py-2 w-64 focus:outline-none focus:border-blue-500 transition-colors"
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
              className={`px-4 py-2 font-semibold ${filter === "income" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                } rounded-l`}
            >
              CASH IN
            </button>
            <button
              onClick={() => setFilter("expenses")}
              className={`px-4 py-2 font-semibold ${filter === "expenses" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
                } rounded-r`}
            >
              CASH OUT
            </button>
          </div>

          {hasPermission(loggedUser as TeamMember, "cashflow", "add") ? (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-500 text-white font-semibold rounded"
            >
              ADD TRANSACTION
            </button>
          ) : null}
        </div>

        <div className="p-4">
          {hasPermission(loggedUser as TeamMember, "cashflow", "view") ? (
            <div className="overflow-x-auto">
              {Object.entries(groupedCashflows).sort(([dateB], [dateA]) => {
                const dA = new Date(dateA);
                const dB = new Date(dateB);

                // Compare years first
                if (dA.getFullYear() !== dB.getFullYear()) {
                  return dA.getFullYear() - dB.getFullYear();
                }

                // If years are the same, compare months
                if (dA.getMonth() !== dB.getMonth()) {
                  return dA.getMonth() - dB.getMonth();
                }

                // If both year and month are the same, compare days
                return dA.getDate() - dB.getDate();
              })
                .map(([date, { total, transactions }]) => (
                  <div key={date} className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{date.toUpperCase()}</h3>
                    <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                      <p>Total: {new Intl.NumberFormat().format(total)} Frw</p>
                      <p>Income: {new Intl.NumberFormat().format(groupedCashflows[date].income)} Frw</p>
                      <p>Expenses: {new Intl.NumberFormat().format(groupedCashflows[date].expenses)} Frw</p>
                      <p className="font-semibold">
                        Remaining Balance: {new Intl.NumberFormat().format(groupedCashflows[date].balance)} Frw
                      </p>
                    </div>
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
                            Payment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((cashflow, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cashflow.user || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Intl.NumberFormat().format(cashflow.amount)} Frw
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cashflow.payment}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cashflow.reason || "N/A"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(cashflow.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-red-500 hover:text-red-900">
                                {hasPermission(loggedUser as TeamMember, "cashflow", "delete") ? (
                                  <button
                                    onClick={() => {
                                      handleDeleteClick(cashflow._id)
                                      setAction(` delete ${cashflow.type} transaction`)
                                    }}
                                  >
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
                  </div>
                ))}
              <div className="mt-6">
                <h4 className="text-lg font-bold text-gray-800">Monthly Totals</h4>
                <ul>
                  {Object.entries(monthlyTotals)
                    .filter(([_, data]) => data.hasFilteredTransactions)
                    .map(([monthYear, data]) => (
                      <li key={monthYear} className="text-sm text-gray-600 mb-2">
                        <div className="font-medium">{monthYear}</div>
                        <div className="flex flex-wrap gap-4 ml-4">
                          <span>Total: {new Intl.NumberFormat().format(data.total)} Frw</span>
                          <span>Income: {new Intl.NumberFormat().format(data.income)} Frw</span>
                          <span>Expenses: {new Intl.NumberFormat().format(data.expenses)} Frw</span>
                          <span className="font-semibold">
                            Remaining Balance: {new Intl.NumberFormat().format(data.balance)} Frw
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-bold text-gray-800">Annual Totals</h4>
                <ul>
                  {Object.entries(annualTotals)
                    .filter(([_, data]) => data.hasFilteredTransactions)
                    .map(([year, data]) => (
                      <li key={year} className="text-sm text-gray-600 mb-2">
                        <div className="font-medium">{year}</div>
                        <div className="flex flex-wrap gap-4 ml-4">
                          <span>Total: {new Intl.NumberFormat().format(data.total)} Frw</span>
                          <span>Income: {new Intl.NumberFormat().format(data.income)} Frw</span>
                          <span>Expenses: {new Intl.NumberFormat().format(data.expenses)} Frw</span>
                          <span className="font-semibold">
                            Remaining Balance: {new Intl.NumberFormat().format(data.balance)} Frw
                          </span>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center">you dont`&apos;t have permission to view this</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">ADD NEW TRANSACTION</h2>

            <div className="flex gap-5 flex-col">
              <select onChange={handleFormData} className="border-2 rounded px-3" name="type" id="type">
                <option value="">Select type</option>
                <option value="income">Cash In </option>
                <option value="expenses">Cash Out</option>
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
              <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
                Submit
              </button>
              <button onClick={() => setShowModal(false)} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
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

