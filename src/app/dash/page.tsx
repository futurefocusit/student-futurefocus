"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import withSuperAdminAuth from "@/components/withSuperAdmin"
import API_BASE_URL from "@/config/baseURL"
import { FaUniversity, FaUserGraduate, FaBook, FaMoneyBillWave, FaBox, FaUsers, FaCreditCard, FaUserCheck, FaStar } from "react-icons/fa"
import Notification from "@/components/Notification"
import TopNav from "@/components/TopNav"
import { useAuth } from "@/context/AuthContext"
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('ffa-admin')
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: getAuthHeader()
})

// API functions
const getAllInstitutions = () => api.get("/institution")
const verifyInstitution = (id: string) => api.put("/institution/verify", { id })
const activateAllFeatures = (id: string, amount: number, months: number) =>
  api.put("/institution/activate-all-features", { id, amount, months })
const activateSomeFeatures = (id: string, amount: number, months: number, features: string[]) =>
  api.put("/subscription/renew", { id, amount, months, features })
const getAllFeatures = () => api.get("/role/feature")
const getSummary = () => api.get("/others/super")

interface Summary {
  institutions: {
    total: number;
    active: number;
    pending: number;
    subscriptions: {
      expiring: number;
      expired: number;
    };
  };
  students: {
    total: number;
    active: number;
  };
  courses: {
    total: number;
    active: number;
  };
  payments: {
    total: number;
    amount: number;
  };
  materials: {
    total: number;
    active: number;
  };
  team: {
    total: number;
    active: number;
  };
  accessPayments: {
    total: number;
    amount: number;
  };
  subscribers: {
    total: number;
    active: number;
  };
  features: {
    mostAccessed: Array<{ feature: string }>;
  };
}

const AdminInstitutionsPage = () => {
  const { fetchLoggedUser, loggedUser } = useAuth();
  const [institutions, setInstitutions] = useState([])
  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [amount, setAmount] = useState("")
  const [months, setMonths] = useState("")
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [accessDetails, setAccessDetails] = useState(null)
  const [allFeatures, setAllFeatures] = useState([])
  const [summary, setSummary] = useState<Summary>({
    institutions: {
      total: 0,
      active: 0,
      pending: 0,
      subscriptions: {
        expiring: 0,
        expired: 0
      }
    },
    students: { total: 0, active: 0 },
    courses: { total: 0, active: 0 },
    payments: { total: 0, amount: 0 },
    materials: { total: 0, active: 0 },
    team: { total: 0, active: 0 },
    accessPayments: { total: 0, amount: 0 },
    subscribers: { total: 0, active: 0 },
    features: { mostAccessed: [] }
  })
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [user, setUser] = useState({
    name: "Super Admin",
    notifications: []
  })

  useEffect(() => {
    fetchInstitutions()
    fetchAllFeatures()
    fetchSummary()
  }, [])

  async function fetchSummary() {
    try {
      const { data } = await getSummary()
      setSummary(data.summary)
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }

  async function fetchInstitutions() {
    try {
      const { data } = await getAllInstitutions()
      setInstitutions(data)

      const accessDetails = data.map((inst) => {
        return inst.access
      })
      setAccessDetails(accessDetails)
      console.log(accessDetails)
    } catch (error) {
      console.error("Failed to fetch institutions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchAllFeatures() {
    try {
      const { data } = await getAllFeatures()
      setAllFeatures(data)
    } catch (error) {
      console.error("Failed to fetch features:", error)
    }
  }

  const handleVerify = async (id) => {
    try {
      await verifyInstitution(id)
      setNotification({ message: "Institution verified successfully", type: "success" })
      fetchInstitutions()
    } catch (error) {
      setNotification({ message: "Failed to verify institution", type: "error" })
    }
  }



  const handleActivateSome = async () => {
    try {
      await activateSomeFeatures(selectedInstitution._id, Number(amount), Number(months), selectedFeatures)
      setNotification({ message: "Selected features activated successfully", type: "success" })
      setSelectedFeatures([])
      fetchInstitutions()
    } catch (error) {
      setNotification({ message: "Failed to activate features", type: "error" })
    }
  }

  const handleFeatureSelection = (featureId) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    )
  }

  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <TopNav userName={user.name} notifications={user.notifications} />
      <div className="p-4 sm:p-6 max-w-[100vw] overflow-x-hidden">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <div className="max-w-7xl mx-auto">


          {/* Summary Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Institutions Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Institutions</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">{summary.institutions.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.institutions.active}</span>
                    <span className="text-sm sm:text-base text-yellow-600">Pending: {summary.institutions.pending}</span>
                  </div>
                </div>
                <FaUniversity className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
            </div>

            {/* Students Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Students</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">{summary.students.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.students.active}</span>
                  </div>
                </div>
                <FaUserGraduate className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
            </div>

            {/* Courses Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Courses</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-purple-600">{summary.courses.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.courses.active}</span>
                  </div>
                </div>
                <FaBook className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500" />
              </div>
            </div>

            {/* Payments Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Payments</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-orange-600">{summary.payments.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Amount: {summary.payments.amount}</span>
                  </div>
                </div>
                <FaMoneyBillWave className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
              </div>
            </div>

            {/* Materials Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Materials</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-red-600">{summary.materials.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.materials.active}</span>
                  </div>
                </div>
                <FaBox className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
            </div>

            {/* Team Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Team Members</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-indigo-600">{summary.team.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.team.active}</span>
                  </div>
                </div>
                <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" />
              </div>
            </div>

            {/* Access Payments Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Access Payments</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-teal-600">{summary.accessPayments.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Amount: {summary.accessPayments.amount}</span>
                  </div>
                </div>
                <FaCreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-teal-500" />
              </div>
            </div>

            {/* Subscribers Card */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600">Subscribers</h3>
                  <p className="text-3xl sm:text-4xl font-bold text-pink-600">{summary.subscribers.total}</p>
                  <div className="flex gap-2 sm:gap-4 mt-2">
                    <span className="text-sm sm:text-base text-green-600">Active: {summary.subscribers.active}</span>
                  </div>
                </div>
                <FaUserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" />
              </div>
            </div>
          </div>

          {/* Subscription Status and Most Accessed Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">Subscription Status</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Expiring Soon</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{summary.institutions.subscriptions.expiring}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Expired</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{summary.institutions.subscriptions.expired}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-4">Most Accessed Features</h3>
              <div className="space-y-2">
                {summary.features.mostAccessed.length > 0 ? (
                  summary.features.mostAccessed.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <FaStar className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm text-gray-700">{allFeatures.find(f => f._id === feature.feature)?.feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">No feature access data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Institutions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstitutions.map((institution) => (
                  <tr key={institution._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{institution.email}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{institution.phone}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${institution.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {institution.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {!institution.verified && (
                          <button
                            onClick={() => handleVerify(institution._id)}
                            className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
                          >
                            Verify
                          </button>
                        )}
                        {institution.verified && (<button
                          onClick={() => {
                            setSelectedInstitution(institution)
                            fetchInstitutions()
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
                        >
                          Manage Access
                        </button>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Manage Access for {selectedInstitution?.name}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Months
                      </label>
                      <input
                        type="number"
                        value={months}
                        onChange={(e) => setMonths(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-4 border rounded-md">
                      {allFeatures.map((feature) => {
                        const institutionFeature = accessDetails.find(access => access.institution === selectedInstitution._id).features.find(f => f.feature === feature._id);
                        const isIncluded = !!institutionFeature;
                        const remainingDays = isIncluded ? Math.ceil((new Date(institutionFeature.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                        return (
                          <div key={feature._id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedFeatures.includes(feature._id)}
                              onChange={() => handleFeatureSelection(feature._id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {feature.feature}
                              {accessDetails && isIncluded && remainingDays ? <span className="ml-2 text-xs font-bold text-green-600">{remainingDays} Days Remaining</span> : <span className="ml-2 text-xs font-bold text-red-600">Not Included</span>}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button
                      onClick={handleActivateSome}
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Activate Selected Features
                    </button>
                  </div>


                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default withSuperAdminAuth(AdminInstitutionsPage)