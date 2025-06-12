"use client"

import { useEffect, useState } from "react"
import { Building2, Save, Eye, Plus, X, Target, TrendingUp, MessageCircle } from "lucide-react"
import withAdminAuth from "@/components/withAdminAuth"
import axios from "axios"
import API_BASE_URL from "@/config/baseURL"
import SideBar from "@/components/SideBar"

interface CompanyData {
  name: string
  location: string
  aboutUs: string
  mission: string
  vision: string
  whyChooseUs: string[]
  email: string
  phone: string
  website: string
  linkedin: string
  instagram: string
  twitter: string
  facebook: string
}

const AdminPage = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    location: "",
    aboutUs: "",
    mission: "",
    vision: "",
    whyChooseUs: ["", "", ""],
    email: "",
    phone: "",
    website: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    facebook: "",
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ type: "", message: "" })

  const loadSavedData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${API_BASE_URL}/institution/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })

      if (response.data) {
        setCompanyData(response.data)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setSaveMessage({
        type: "error",
        message: "Failed to load company data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSavedData()
  }, [])

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear any previous save messages when user makes changes
    if (saveMessage.message) {
      setSaveMessage({ type: "", message: "" })
    }
  }

  const handleArrayChange = (field: "whyChooseUs", index: number, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: "whyChooseUs") => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: "whyChooseUs", index: number) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await axios.put(`${API_BASE_URL}/institution/profile`, companyData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ffa-admin")}`,
        },
      })
      setSaveMessage({
        type: "success",
        message: "Company profile saved successfully!",
      })
    } catch (error) {
      console.error("Error saving data:", error)
      setSaveMessage({
        type: "error",
        message: "Failed to save company profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (showPreview) {
    return <CompanyProfilePreview data={companyData} onBack={() => setShowPreview(false)} />
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="md:w-64 w-full md:sticky top-0 h-auto md:h-screen z-10">
        <SideBar />
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-full md:max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Company Profile Admin</h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadSavedData}
                disabled={isLoading}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Reload Data"}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-1" />
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {saveMessage.message && (
            <div
              className={`p-3 rounded-md mb-4 ${
                saveMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {saveMessage.message}
            </div>
          )}

          <p className="text-gray-600">Update your company information below.</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={companyData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter company name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={companyData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, Country"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* About Us */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                About Us
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <label htmlFor="aboutUs" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description
              </label>
              <textarea
                id="aboutUs"
                value={companyData.aboutUs}
                onChange={(e) => handleInputChange("aboutUs", e.target.value)}
                placeholder="Write 2-3 sentences about your company..."
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Mission
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <label htmlFor="mission" className="block text-sm font-medium text-gray-700 mb-1">
                  Mission Statement
                </label>
                <textarea
                  id="mission"
                  value={companyData.mission}
                  onChange={(e) => handleInputChange("mission", e.target.value)}
                  placeholder="Your company's mission statement..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Vision
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <label htmlFor="vision" className="block text-sm font-medium text-gray-700 mb-1">
                  Vision Statement
                </label>
                <textarea
                  id="vision"
                  value={companyData.vision}
                  onChange={(e) => handleInputChange("vision", e.target.value)}
                  placeholder="Your long-term vision..."
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Why Choose Us
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-2">
                {companyData.whyChooseUs.map((reason, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => handleArrayChange("whyChooseUs", index, e.target.value)}
                      placeholder="Enter reason to choose your company"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      onClick={() => removeArrayItem("whyChooseUs", index)}
                      className="p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem("whyChooseUs")}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Reason
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={companyData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="company@example.com"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="phone"
                    value={companyData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={companyData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    placeholder="https://www.yourcompany.com"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-3">Social Media Links</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm text-gray-600 mb-1">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      value={companyData.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm text-gray-600 mb-1">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      value={companyData.instagram}
                      onChange={(e) => handleInputChange("instagram", e.target.value)}
                      placeholder="https://instagram.com/yourcompany"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm text-gray-600 mb-1">
                      X (Twitter)
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      value={companyData.twitter}
                      onChange={(e) => handleInputChange("twitter", e.target.value)}
                      placeholder="https://x.com/yourcompany"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm text-gray-600 mb-1">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      value={companyData.facebook}
                      onChange={(e) => handleInputChange("facebook", e.target.value)}
                      placeholder="https://facebook.com/yourcompany"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-6 pb-10">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="w-5 h-5 inline mr-2" />
              {isSaving ? "Saving..." : "Save Company Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview Component
function CompanyProfilePreview({ data, onBack }: { data: CompanyData; onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Company Profile Preview</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Edit
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-8 border-b pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{data.name || "[Your Company Name]"}</h1>
        <h2 className="text-lg sm:text-xl text-gray-600 font-medium">Company Profile</h2>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Company Name:</strong> {data.name || "[Your Company Name]"}
              </div>
              <div>
                <strong>Location:</strong> {data.location || "[City, Country]"}
              </div>
            </div>
          </div>
        </div>

        {/* About Us */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-600" />
              About Us
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-700 leading-relaxed">
              {data.aboutUs ||
                "[Write 2–3 sentences about your company — what you do, when you started, and your purpose.]"}
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Mission
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-700 leading-relaxed">{data.mission || "[Your company's mission statement.]"}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Vision
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-700 leading-relaxed">{data.vision || "[Your long-term vision.]"}</p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Why Choose Us
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ul className="space-y-2">
              {data.whyChooseUs
                .filter((reason) => reason.trim())
                .map((reason, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                    <span>{reason}</span>
                  </li>
                ))}
              {data.whyChooseUs.filter((reason) => reason.trim()).length === 0 && (
                <li className="text-gray-500">[Add reasons why customers should choose your company]</li>
              )}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Contact Us
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Email:</strong> {data.email || "[Your Email]"}
              </div>
              <div>
                <strong>Phone:</strong> {data.phone || "[Your Phone Number]"}
              </div>
              <div className="col-span-1 md:col-span-2">
                <strong>Website:</strong> {data.website || "[Your Website]"}
              </div>
            </div>

            <div>
              <strong>Social Media:</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.linkedin && (
                  <a
                    href={data.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                  >
                    LinkedIn
                  </a>
                )}
                {data.instagram && (
                  <a
                    href={data.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm hover:bg-pink-200"
                  >
                    Instagram
                  </a>
                )}
                {data.twitter && (
                  <a
                    href={data.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    X (Twitter)
                  </a>
                )}
                {data.facebook && (
                  <a
                    href={data.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                  >
                    Facebook
                  </a>
                )}
                {!data.linkedin && !data.instagram && !data.twitter && !data.facebook && (
                  <span className="text-gray-500">[Social Media Links]</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} {data.name || "[Your Company Name]"}. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default withAdminAuth(AdminPage)
