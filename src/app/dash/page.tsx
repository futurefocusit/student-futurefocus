"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import withSuperAdminAuth from "@/components/withSuperAdmin"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

// Main component
const AdminInstitutionsPage=()=> {
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

  useEffect(() => {
    fetchInstitutions()
    fetchAllFeatures()
  }, [])

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
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId],
    )
  }

  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Manage Institutions</h1>
      <input
        type="text"
        placeholder="Search institutions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "4px", border: "1px solid #ddd" }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Name</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Email</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Phone</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Verified</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInstitutions.map((institution) => (
            <tr key={institution._id}>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{institution.name}</td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{institution.email}</td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{institution.phone}</td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{institution.verified ? "Yes" : "No"}</td>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {!institution.verified && (
                  <button
                    onClick={() => handleVerify(institution._id)}
                    style={{
                      marginRight: "10px",
                      padding: "5px 10px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
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
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#008CBA",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Manage Access
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Manage Access for {selectedInstitution?.name}</h2>
            <div style={{ marginBottom: "10px" }}>
              <label htmlFor="amount" style={{ display: "block", marginBottom: "5px" }}>
                Amount:
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label htmlFor="months" style={{ display: "block", marginBottom: "5px" }}>
                Months:
              </label>
              <input
                id="months"
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                style={{ width: "100%", padding: "5px" }}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Features:</label>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
                {allFeatures.map((feature) => (
                  <div key={feature._id} style={{ marginBottom: "5px" }}>
                    <label style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature._id)}
                        onChange={() => handleFeatureSelection(feature._id)}
                        style={{ marginRight: "10px" }}
                      />
                      {feature.feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <button
                onClick={handleActivateAll}
                style={{
                  marginRight: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Activate All Features
              </button>
              <button
                onClick={handleActivateSome}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#008CBA",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Activate Selected Features
              </button>
            </div>
            {accessDetails && (
              <div>
                <h3 style={{ marginBottom: "10px" }}>Current Features:</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "5px", borderBottom: "1px solid #ddd" }}>Feature</th>
                      <th style={{ textAlign: "left", padding: "5px", borderBottom: "1px solid #ddd" }}>Active</th>
                      <th style={{ textAlign: "left", padding: "5px", borderBottom: "1px solid #ddd" }}>Due Date</th>
                      <th style={{ textAlign: "left", padding: "5px", borderBottom: "1px solid #ddd" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessDetails.features.map((feature) => (
                      <tr key={feature.feature}>
                        <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                          {allFeatures.find((f) => f._id === feature.feature)?.feature || "Unknown"}
                        </td>
                        <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                          <input
                            type="checkbox"
                            checked={feature.active}
                            onChange={(e) => handleUpdateFeature(feature.feature, e.target.checked, feature.dueDate)}
                          />
                        </td>
                        <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                          <input
                            type="date"
                            value={new Date(feature.dueDate).toISOString().split("T")[0]}
                            onChange={(e) =>
                              handleUpdateFeature(feature.feature, feature.active, new Date(e.target.value))
                            }
                          />
                        </td>
                        <td style={{ padding: "5px", borderBottom: "1px solid #ddd" }}>
                          <button
                            onClick={() => handleRemoveFeature(feature.feature)}
                            style={{
                              padding: "3px 6px",
                              backgroundColor: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default withSuperAdminAuth(AdminInstitutionsPage)
