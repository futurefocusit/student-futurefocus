"use client"

import { useEffect, useState } from "react"
import { Building2, Save, Eye, Plus, X, Target, TrendingUp, MessageCircle, Clock, Globe, Image as ImageIcon, Loader2 } from "lucide-react"
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
  gallery: Array<{ url: string, caption?: string, isEditingCaption: boolean }>
  mission: string
  vision: string
  slug: string
  days: Array<{ day: string, opening: string, closing: string }>
  whyChooseUs: string[]
  linkedin: string
  instagram: string
  tiktok: string
  facebook: string
  description: string
  aboutUs: string
  email: string
  phone: Array<{ type: string, number: string }>
  logo: string
  website: string
  isSuperInst: boolean
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

// Move these components outside of AdminPage
const CaptionEditor = ({
  image,
  index,
  onSave,
  onCancel,
  onCaptionChange
}: {
  image: { url: string; caption?: string; isEditingCaption: boolean };
  index: number;
  onSave: (index: number) => void;
  onCancel: (index: number) => void;
  onCaptionChange: (index: number, value: string) => void;
}) => {
  const [tempCaption, setTempCaption] = useState(image.caption);

  const handleSave = () => {
    onCaptionChange(index, tempCaption);
    onSave(index);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={tempCaption}
        onChange={(e) => setTempCaption(e.target.value)}
        placeholder="Add a caption..."
        className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={2}
        autoFocus
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => onCancel(index)}
          className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const CaptionDisplay = ({
  caption,
  onEdit
}: {
  caption: string;
  onEdit: () => void;
}) => (
  <div
    className="min-h-[2.5rem] cursor-pointer group/caption"
    onClick={onEdit}
  >
    {caption ? (
      <p className="text-sm text-gray-700 line-clamp-2 group-hover/caption:text-blue-600">
        {caption}
      </p>
    ) : (
      <p className="text-sm text-gray-400 italic group-hover/caption:text-blue-600">
        Click to add caption
      </p>
    )}
  </div>
);

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
    days: [{ day: "", opening: "", closing: "" }],
    whyChooseUs: [""],
    linkedin: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    description: "",
    aboutUs: "",
    email: "",
    phone: [{ type: "", number: "" }],
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

  const handleArrayChange = (field: "coreValues" | "languages" | "whyChooseUs" | "phone" | "gallery" | "days", index: number, value, subField?: string) => {
    setCompanyData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => {
        if (i === index) {
          if (subField) {
            return { ...item, [subField]: value };
          }
          return value;
        }
        return item;
      }),
    }))
  }

  const addArrayItem = (field: "coreValues" | "languages" | "whyChooseUs" | "phone" | "gallery" | "days") => {
    setCompanyData((prev) => {
      const newItem = field === "phone" ? { type: "", number: "" } :
        field === "gallery" ? { url: "", caption: "", isEditingCaption: false } :
          field === "days" ? { day: "", opening: "", closing: "" } : "";
      return {
        ...prev,
        [field]: [...prev[field], newItem],
      }
    })
  }

  const removeArrayItem = (field: "coreValues" | "languages" | "whyChooseUs" | "phone" | "gallery" | "days", index: number) => {
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

      Array.from(files).forEach(file => formData.append('files', file))

      const response = await fetchWithRetry(() =>
        axiosInstance.post(`${API_BASE_URL}/upload/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      )

      if (type === 'gallery') {
        const newImages = response.data.urls.map((url: string) => ({
          url: url,
          caption: "",
          isEditingCaption: false
        }))
        setCompanyData(prev => ({
          ...prev,
          gallery: [...prev.gallery, ...newImages]
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

  const handleCaptionChange = (index: number, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      gallery: prev.gallery.map((img, i) =>
        i === index ? { ...img, caption: value } : img
      )
    }));
  };

  const handleCaptionEdit = (index: number, isEditing: boolean) => {
    setCompanyData(prev => ({
      ...prev,
      gallery: prev.gallery.map((img, i) => ({
        ...img,
        isEditingCaption: i === index ? isEditing : false
      }))
    }));
  };

  const handleCaptionSave = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      gallery: prev.gallery.map((img, i) => ({
        ...img,
        isEditingCaption: false
      }))
    }));
  };

  const handleCaptionCancel = (index: number) => {
    setCompanyData(prev => ({
      ...prev,
      gallery: prev.gallery.map((img, i) => ({
        ...img,
        isEditingCaption: false
      }))
    }));
  };

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

  // Add a specific function for handling phone changes
  const handlePhoneChange = (index: number, field: 'type' | 'number', value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      phone: prev.phone.map((phone, i) => {
        if (i === index) {
          return {
            ...phone,
            [field]: value
          };
        }
        return phone;
      })
    }));
  };

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

              {/* Opening Hours Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Opening Hours</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem("days")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Day
                  </button>
                </div>
                <div className="space-y-4">
                  {companyData.days.map((day, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <label htmlFor={`day-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Day
                        </label>
                        <select
                          id={`day-${index}`}
                          value={day.day || ""}
                          onChange={(e) => handleArrayChange("days", index, { ...day, day: e.target.value }, "day")}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        >
                          <option value="">Select a day</option>
                          {DAYS_OF_WEEK.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`opening-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          id={`opening-${index}`}
                          value={day.opening || ""}
                          onChange={(e) => handleArrayChange("days", index, { ...day, opening: e.target.value }, "opening")}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`closing-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          id={`closing-${index}`}
                          value={day.closing || ""}
                          onChange={(e) => handleArrayChange("days", index, { ...day, closing: e.target.value }, "closing")}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeArrayItem("days", index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone Numbers Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Phone Numbers</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyData(prev => ({
                        ...prev,
                        phone: [...prev.phone, { type: "", number: "" }]
                      }));
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phone
                  </button>
                </div>

                <div className="space-y-4">
                  {companyData.phone.map((phone, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <label htmlFor={`phone-type-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Type (e.g., Main, Mobile, WhatsApp)
                        </label>
                        <input
                          type="text"
                          id={`phone-type-${index}`}
                          value={phone.type}
                          onChange={(e) => handlePhoneChange(index, 'type', e.target.value)}
                          placeholder="Enter phone type"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor={`phone-number-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id={`phone-number-${index}`}
                          value={phone.number}
                          onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                          placeholder="Enter phone number"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            setCompanyData(prev => ({
                              ...prev,
                              phone: prev.phone.filter((_, i) => i !== index)
                            }));
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
                    <p className="text-sm text-gray-500 mt-1">Add images with captions to showcase your institution</p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      id="gallery-upload"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "gallery")}
                      className="hidden"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="gallery-upload"
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${uploadingImages ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        } transition-colors duration-200`}
                    >
                      {uploadingImages ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {companyData.gallery.map((image, index) => {
                    // Type guard to ensure we have valid image data
                    if (!image || typeof image !== 'object' || !('url' in image)) {
                      return null;
                    }

                    const imageUrl = String(image.url || '');
                    const imageCaption = String(image.caption || '');
                    const isEditing = Boolean(image.isEditingCaption);

                    return (
                      <div key={index} className="group relative bg-gray-50 rounded-lg overflow-hidden">
                        <div className="relative aspect-square">
                          <Image
                            src={imageUrl}
                            alt={imageCaption || `Gallery image ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem("gallery", index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-3">
                          {isEditing ? (
                            <CaptionEditor
                              image={image}
                              index={index}
                              onSave={handleCaptionSave}
                              onCancel={handleCaptionCancel}
                              onCaptionChange={handleCaptionChange}
                            />
                          ) : (
                            <CaptionDisplay
                              caption={imageCaption}
                              onEdit={() => handleCaptionEdit(index, true)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {companyData.gallery.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No images uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload images to showcase your institution</p>
                  </div>
                )}
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
                <strong>Phone:</strong> {data.phone.map(p => p.number).join(", ") || "[Your Phone Number]"}
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
