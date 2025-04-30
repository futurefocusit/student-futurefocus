"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import withSuperAdminAuth from "@/components/withSuperAdmin"
import API_BASE_URL from "@/config/baseURL"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Authorization": `Bearer ${localStorage.getItem('ffa-admin')}`
  }
})

// API functions
const getAllInstitutions = () => api.get("/institution")
const verifyInstitution = (id: string) => api.put("/institution/verify", { id })
const activateAllFeatures = (id: string, amount: number, months: number) =>
  api.put("/institution/activate-all-features", { id, amount, months })
const activateSomeFeatures = (id: string, amount: number, months: number, features: string[]) =>
  api.put("/institution/activate-some-features", { id, amount, months, features })
const getAccessDetails = (id: string) => api.get(`/institutions/${id}/access`)
const updateFeature = (id: string, featureId: string, active: boolean, dueDate: Date) =>
  api.put(`/institution/${id}/features/${featureId}`, { active, dueDate })
const removeFeature = (id: string, featureId: string) => api.delete(`/institution/${id}/features/${featureId}`)
const getAllFeatures = () => api.get("/role/feature")

const AdminInstitutionsPage = () => {
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
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    verifiedInstitutions: 0,
    activeFeatures: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    fetchInstitutions()
    fetchAllFeatures()
    calculateStats()
  }, [])

  const calculateStats = () => {
    const totalInstitutions = institutions.length
    const verifiedInstitutions = institutions.filter(inst => inst.verified).length
    const activeFeatures = institutions.reduce((acc, inst) => acc + (inst.activeFeatures || 0), 0)
    const totalRevenue = institutions.reduce((acc, inst) => acc + (inst.revenue || 0), 0)

    setStats({
      totalInstitutions,
      verifiedInstitutions,
      activeFeatures,
      totalRevenue
    })
  }

  async function fetchInstitutions() {
    try {
      const { data } = await getAllInstitutions()
      setInstitutions(data)
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
      alert("Institution verified successfully")
      fetchInstitutions()
    } catch (error) {
      alert("Failed to verify institution")
    }
  }

  const handleActivateAll = async () => {
    try {
      await activateAllFeatures(selectedInstitution._id, Number(amount), Number(months))
      alert("All features activated successfully")
      fetchAccessDetails(selectedInstitution._id)
    } catch (error) {
      alert("Failed to activate features")
    }
  }

  const handleActivateSome = async () => {
    try {
      await activateSomeFeatures(selectedInstitution._id, Number(amount), Number(months), selectedFeatures)
      alert("Selected features activated successfully")
      fetchAccessDetails(selectedInstitution._id)
    } catch (error) {
      alert("Failed to activate features")
    }
  }

  const fetchAccessDetails = async (id) => {
    try {
      const { data } = await getAccessDetails(id)
      setAccessDetails(data)
    } catch (error) {
      console.error("Failed to fetch access details:", error)
    }
  }

  const handleUpdateFeature = async (featureId, active, dueDate) => {
    try {
      await updateFeature(selectedInstitution._id, featureId, active, dueDate)
      alert("Feature updated successfully")
      fetchAccessDetails(selectedInstitution._id)
    } catch (error) {
      alert("Failed to update feature")
    }
  }

  const handleRemoveFeature = async (featureId) => {
    try {
      await removeFeature(selectedInstitution._id, featureId)
      alert("Feature removed successfully")
      fetchAccessDetails(selectedInstitution._id)
    } catch (error) {
      alert("Failed to remove feature")
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Institution Management</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600">Total Institutions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalInstitutions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600">Verified Institutions</h3>
            <p className="text-3xl font-bold text-green-600">{stats.verifiedInstitutions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600">Active Features</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.activeFeatures}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
            <p className="text-3xl font-bold text-orange-600">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInstitutions.map((institution) => (
                <tr key={institution._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{institution.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{institution.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${institution.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {institution.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {!institution.verified && (
                        <button
                          onClick={() => handleVerify(institution._id)}
                          className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedInstitution(institution)
                          fetchAccessDetails(institution._id)
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md"
                      >
                        Manage Access
                      </button>
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
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Features
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto p-4 border rounded-md">
                    {allFeatures.map((feature) => (
                      <div key={feature._id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature._id)}
                          onChange={() => handleFeatureSelection(feature._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          {feature.feature}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleActivateAll}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Activate All Features
                  </button>
                  <button
                    onClick={handleActivateSome}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Activate Selected Features
                  </button>
                </div>

                {accessDetails && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Features</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {accessDetails.features.map((feature) => (
                            <tr key={feature.feature}>
                              <td className="px-4 py-2">
                                {allFeatures.find((f) => f._id === feature.feature)?.feature || "Unknown"}
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={feature.active}
                                  onChange={(e) => handleUpdateFeature(feature.feature, e.target.checked, feature.dueDate)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="date"
                                  value={new Date(feature.dueDate).toISOString().split("T")[0]}
                                  onChange={(e) => handleUpdateFeature(feature.feature, feature.active, new Date(e.target.value))}
                                  className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => handleRemoveFeature(feature.feature)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default withSuperAdminAuth(AdminInstitutionsPage)