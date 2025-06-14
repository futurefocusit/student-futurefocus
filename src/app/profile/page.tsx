"use client"

import { useEffect, useState } from "react"
import { Building2, Save, Eye, Plus, X, Target, TrendingUp, MessageCircle, Clock, Globe, Image as ImageIcon } from "lucide-react"
import withAdminAuth from "@/components/withAdminAuth"
import axiosInstance, { fetchWithCache, fetchWithRetry } from "@/libs/axios"
import API_BASE_URL from "@/config/baseURL"
import SideBar from "@/components/SideBar"
import BlogEditor from "@/components/Editor"
import Image from "next/image"

interface CompanyData {
  name: string
  location: string
  coreValues: string[]
  heroImage: string
  address: string
  languages: string[]
  gallery: string[]
  mission: string
  vision: string
  slug: string
  opening: string
  closing: string
  whyChooseUs: string[]
  linkedin: string
  instagram: string
  tiktok: string
  facebook: string
  description: string
  aboutUs: string
  email: string
  phone: string[]
  logo: string
  website: string
  isSuperInst: boolean
}

const AdminPage = () => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: "",
    location: "",
    coreValues: [""],
    heroImage: "",
    address: "",
    languages: [""],
    gallery: [],
    mission: "",
    vision: "",
    slug: "",
    opening: "",
    closing: "",
    whyChooseUs: [""],
    linkedin: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    description: "",
    aboutUs: "",
    email: "",
    phone: [""],
    logo: "",
    website: "",
    isSuperInst: false
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ type: "", message: "" })
  const [uploadingImages, setUploadingImages] = useState(false)

  const loadSavedData = async () => {
    try {
      setIsLoading(true)
      const response = await fetchWithCache<CompanyData>(`${API_BASE_URL}/institution/profile`)
      if (response) {
        setCompanyData(response)
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
    if (saveMessage.message) {
      setSaveMessage({ type: "", message: "" })
    }
  }

  const handleArrayChange = (field: "coreValues" | "languages" | "whyChooseUs" | "phone", index: number, value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }))
  }

  const addArrayItem = (field: "coreValues" | "languages" | "whyChooseUs" | "phone") => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  const removeArrayItem = (field: "coreValues" | "languages" | "whyChooseUs" | "phone", index: number) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'heroImage' | 'gallery') => {
    const files = e.target.files
    if (!files) return

    try {
      setUploadingImages(true)
      const formData = new FormData()

      // if (type === 'gallery') {
        Array.from(files).forEach(file => formData.append('files', file))
      // } else {
      //   formData.append('files', files)
      // }

      const response = await fetchWithRetry(() =>
        axiosInstance.post(`${API_BASE_URL}/upload/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )

      if (type === 'gallery') {
        setCompanyData(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...response.data.urls]
        }))
      } else {
        setCompanyData(prev => ({
          ...prev,
          [type]: response.data.urls[0]
        }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setSaveMessage({
        type: "error",
        message: "Failed to upload image. Please try again.",
      })
    } finally {
      setUploadingImages(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await fetchWithRetry(() =>
        axiosInstance.put(`${API_BASE_URL}/institution/profile`, companyData)
      )
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
              className={`p-3 rounded-md mb-4 ${saveMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={companyData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={companyData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={companyData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={companyData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="opening" className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours *
                  </label>
                  <input
                    type="time"
                    id="opening"
                    value={companyData.opening}
                    onChange={(e) => handleInputChange("opening", e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="closing" className="block text-sm font-medium text-gray-700 mb-1">
                    Closing Hours *
                  </label>
                  <input
                    type="time"
                    id="closing"
                    value={companyData.closing}
                    onChange={(e) => handleInputChange("closing", e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Numbers *
                </label>
                {companyData.phone.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handleArrayChange("phone", index, e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("phone", index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("phone")}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Phone Number
                </button>
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Images
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {companyData.logo && (
                    <div className="relative w-24 h-24">
                      <Image
                        src={companyData.logo}
                        alt="Company Logo"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    disabled={uploadingImages}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Hero Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image
                </label>
                <div className="flex items-center gap-4">
                  {companyData.heroImage && (
                    <div className="relative w-48 h-32">
                      <Image
                        src={companyData.heroImage}
                        alt="Hero Image"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'heroImage')}
                    disabled={uploadingImages}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {/* Gallery Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {companyData.gallery.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-32">
                        <Image
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e, 'gallery')}
                  disabled={uploadingImages}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>

          
          <div className="bg-white shadow rounded-lg overflow-hidden">
            
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Us
                </label>
                <BlogEditor
                  initialContent={companyData.aboutUs}
                  onChange={(content) => handleInputChange("aboutUs", content)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <BlogEditor
                  initialContent={companyData.description}
                  onChange={(content) => handleInputChange("description", content)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mission
                </label>
                <BlogEditor
                  initialContent={companyData.mission}
                  onChange={(content) => handleInputChange("mission", content)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vision
                </label>
                <BlogEditor
                  initialContent={companyData.vision}
                  onChange={(content) => handleInputChange("vision", content)}
                />
              </div>
            </div>
          </div>

          {/* Core Values & Languages */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Core Values & Languages
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Core Values
                </label>
                {companyData.coreValues.map((value, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleArrayChange("coreValues", index, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("coreValues", index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("coreValues")}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Core Value
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages
                </label>
                {companyData.languages.map((language, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => handleArrayChange("languages", index, e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem("languages", index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem("languages")}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Language
                </button>
              </div>
            </div>
          </div>

          {/* Social Media & Contact */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Social Media & Contact
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    value={companyData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    value={companyData.linkedin}
                    onChange={(e) => handleInputChange("linkedin", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram"
                    value={companyData.instagram}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
                    TikTok
                  </label>
                  <input
                    type="url"
                    id="tiktok"
                    value={companyData.tiktok}
                    onChange={(e) => handleInputChange("tiktok", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    value={companyData.facebook}
                    onChange={(e) => handleInputChange("facebook", e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
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
                {data.tiktok && (
                  <a
                    href={data.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                  >
                    TikTok
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
                {!data.linkedin && !data.instagram && !data.tiktok && !data.facebook && (
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
