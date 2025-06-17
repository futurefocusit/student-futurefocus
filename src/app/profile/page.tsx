"use client"

import { useEffect, useState } from "react"
import { Building2, Save, Eye, Plus, X, Target, TrendingUp, MessageCircle, Clock, Globe, Image as ImageIcon, Loader2, Star, MapPin, ExternalLink } from "lucide-react"
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

  // Add specific function for handling days changes
  const handleDaysChange = (index: number, field: 'day' | 'opening' | 'closing', value: string) => {
    setCompanyData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => {
        if (i === index) {
          return {
            ...day,
            [field]: value
          };
        }
        return day;
      })
    }));
  };

  // Add validation for working days
  const validateWorkingDays = () => {
    const validDays = companyData.days.filter(day =>
      day.day && day.opening && day.closing
    );

    // Check for duplicate days
    const dayNames = validDays.map(day => day.day);
    const uniqueDays = new Set(dayNames);

    if (dayNames.length !== uniqueDays.size) {
      setSaveMessage({
        type: "error",
        message: "Duplicate working days detected. Please remove duplicates.",
      });
      return false;
    }

    return true;
  };

  // Add function to populate common working hours
  const populateCommonHours = (pattern: 'weekdays' | 'full-week' | 'custom') => {
    let newDays = [];

    if (pattern === 'weekdays') {
      newDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
        day,
        opening: '09:00',
        closing: '17:00'
      }));
    } else if (pattern === 'full-week') {
      newDays = DAYS_OF_WEEK.map(day => ({
        day,
        opening: day === 'Sunday' ? '10:00' : '09:00',
        closing: day === 'Sunday' ? '16:00' : '17:00'
      }));
    }

    if (newDays.length > 0) {
      setCompanyData(prev => ({
        ...prev,
        days: newDays
      }));

      setSaveMessage({
        type: "success",
        message: `Populated ${pattern === 'weekdays' ? 'weekday' : 'full week'} hours. You can adjust the times as needed.`,
      });
    }
  };

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
      // Validate working days before saving
      if (!validateWorkingDays()) {
        return;
      }

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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      Opening Hours
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Set your business operating hours for each day of the week</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addArrayItem("days")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Day
                  </button>
                </div>

                {companyData.days.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No working days added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add your business hours to help customers know when you're open</p>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => populateCommonHours('weekdays')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Weekdays (9 AM - 5 PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => populateCommonHours('full-week')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Full Week
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {companyData.days.map((day, index) => {
                    const isComplete = day.day && day.opening && day.closing;
                    const isDuplicate = companyData.days.filter(d => d.day === day.day).length > 1;

                    return (
                      <div
                        key={index}
                        className={`flex flex-col sm:flex-row gap-4 p-4 border rounded-lg transition-all duration-200 ${isComplete && !isDuplicate
                          ? 'border-green-200 bg-green-50'
                          : isDuplicate
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-white'
                          }`}
                      >
                        <div className="flex-1">
                          <label htmlFor={`day-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Day *
                          </label>
                          <select
                            id={`day-${index}`}
                            value={day.day || ""}
                            onChange={(e) => handleDaysChange(index, 'day', e.target.value)}
                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${isDuplicate ? 'border-red-300' : 'border-gray-300'
                              }`}
                            required
                          >
                            <option value="">Select a day</option>
                            {DAYS_OF_WEEK.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          {isDuplicate && (
                            <p className="text-red-600 text-xs mt-1">Duplicate day selected</p>
                          )}
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`opening-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Opening Time *
                          </label>
                          <input
                            type="time"
                            id={`opening-${index}`}
                            value={day.opening || ""}
                            onChange={(e) => handleDaysChange(index, 'opening', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label htmlFor={`closing-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                            Closing Time *
                          </label>
                          <input
                            type="time"
                            id={`closing-${index}`}
                            value={day.closing || ""}
                            onChange={(e) => handleDaysChange(index, 'closing', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeArrayItem("days", index)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Remove this day"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {companyData.days.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Tip:</strong> Make sure to set different hours for each day and avoid duplicate entries.
                    </p>
                  </div>
                )}
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showTextPopup, setShowTextPopup] = useState(false)
  const [showGalleryPopup, setShowGalleryPopup] = useState(false)
  const [showFullImage, setShowFullImage] = useState<string | null>(null)
  const [popupContent, setPopupContent] = useState({ title: "", content: "" })
  const [selectedGallery, setSelectedGallery] = useState<Array<{ url: string, caption?: string }>>([])

  const sectionItems = [
    { name: "About Us", href: "#about", icon: Building2 },
    { name: "Mission & Vision", href: "#mission-vision", icon: Target },
    { name: "Core Values", href: "#core-values", icon: Star },
    { name: "Gallery", href: "#gallery", icon: ImageIcon },
    { name: "Contact Info", href: "#contact-info", icon: MessageCircle },
  ]

  // Add HTMLContent component for safe HTML rendering
  const HTMLContent = ({ content, className = "" }: { content: string; className?: string }) => (
    <div
      className={`prose prose-blue max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content || "" }}
    />
  );

  // Add TextWithReadMore component
  const TextWithReadMore = ({
    content,
    title,
    maxLength = 200,
    className = ""
  }: {
    content: string;
    title: string;
    maxLength?: number;
    className?: string;
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldTruncate = content?.length > maxLength;
    const displayContent = isExpanded ? content : content?.slice(0, maxLength) + "...";

    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className=" rounded-t-2xl text-xl font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">{title}</h3>
        <div className="relative">
          <HTMLContent
            content={displayContent}
            className="text-gray-700 leading-relaxed"
          />
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              {isExpanded ? "Show Less" : "Read More"}
              <svg
                className={`w-4 h-4 ml-1 transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const GallerySection = ({ images }: { images: Array<{ url: string, caption?: string }> }) => {
    const displayImages = images.slice(0, 4)
    const hasMore = images.length > 4

    const handleViewMore = () => {
      setSelectedGallery(images)
      setShowGalleryPopup(true)
    }

    const handleImageClick = (image: { url: string, caption?: string }) => {
      setShowFullImage(image.url)
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square cursor-pointer group"
              onClick={() => handleImageClick(image)}
            >
              <Image
                src={image.url}
                alt={image.caption || `Gallery image ${index + 1}`}
                fill
                className="object-cover rounded-lg transition-transform group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm rounded-b-lg">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        {hasMore && (
          <button
            onClick={handleViewMore}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Images ({images.length})
          </button>
        )}
      </div>
    )
  }

  const TextPopup = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">{popupContent.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{popupContent.content}</p>
        </div>
        <div className="p-4 border-t">
          <button
            onClick={() => setShowTextPopup(false)}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  const GalleryPopup = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {selectedGallery.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square cursor-pointer group"
              onClick={() => setShowFullImage(image.url)}
            >
              <Image
                src={image.url}
                alt={image.caption || `Gallery image ${index + 1}`}
                fill
                className="object-cover rounded-lg transition-transform group-hover:scale-105"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm rounded-b-lg">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowGalleryPopup(false)}
            className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  )

  const FullImagePopup = () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setShowFullImage(null)}>
      {showFullImage && (
        <div className="relative max-w-6xl w-full max-h-[90vh]">
          <Image
            src={showFullImage}
            alt="Full size image"
            width={1200}
            height={800}
            className="object-contain max-h-[90vh] w-auto mx-auto"
          />
          <button
            onClick={() => setShowFullImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Section Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-700 to-yellow-800 border-b border-yellow-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-8">
                {sectionItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-white hover:text-yellow-200 transition-colors duration-200"
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </a>
                  )
                })}
              </div>
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                <X className="h-5 w-5 mr-2" />
                Back to Edit
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-yellow-200 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {sectionItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-base font-medium text-white hover:text-yellow-200 hover:bg-yellow-800 rounded-md transition-colors duration-200"
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Hero Section */}
        <div id="about" className="relative overflow-hidden">
          {data.heroImage && (
            <div className="absolute inset-0">
              <Image
                src={data.heroImage}
                alt="Hero Background"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-900/90"></div>
            </div>
          )}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              {data.logo && (
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl shadow-lg mb-8">
                  <Image
                    src={data.logo}
                    alt="Company Logo"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {data.name || "[Your Company Name]"}
              </h1>

              {data.location && (
                <div className="flex items-center justify-center text-blue-100 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {data.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* About Us */}
            <div id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <TextWithReadMore
                  content={data.aboutUs}
                  title="About Us"
                  maxLength={300}
                />
              </div>
            </div>

            {/* Mission & Vision */}
            <div id="mission-vision" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <TextWithReadMore
                    content={data.mission}
                    title="Mission"
                    maxLength={200}
                  />
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <TextWithReadMore
                    content={data.vision}
                    title="Vision"
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <TextWithReadMore
                  content={data.description}
                  title="Description"
                  maxLength={400}
                />
              </div>
            </div>

            {/* Why Choose Us */}
            <div id="why-choose-us" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl shadow-xl p-8 ">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">Why Choose Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.whyChooseUs.map((reason, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <HTMLContent
                        content={reason}
                        className="text-gray-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Values & Languages */}
            <div id="core-values" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.coreValues.length > 0 && data.coreValues[0] && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-blue-800" />
                      </div>
                      Core Values
                    </h3>
                  </div>
                  <div className="px-6 py-8">
                    <ul className="space-y-3">
                      {data.coreValues.map((value, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {data.languages.length > 0 && data.languages[0] && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Globe className="w-6 h-6 text-blue-800" />
                      </div>
                      Languages
                    </h3>
                  </div>
                  <div className="px-6 py-8">
                    <div className="flex flex-wrap gap-2">
                      {data.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery */}
            {data.gallery.length > 0 && (
              <div id="gallery" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-blue-800" />
                    </div>
                    Gallery
                  </h3>
                </div>
                <div className="px-6 py-8">
                  <GallerySection images={data.gallery} />
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div id="contact-info" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-800" />
                  </div>
                  Contacts
                </h3>
              </div>
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Contact Details</h4>
                      <div className="space-y-2">
                        {data.email && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Email:</span>
                            <a href={`mailto:${data.email}`} className="text-blue-600 hover:text-blue-800">
                              {data.email}
                            </a>
                          </p>
                        )}
                        {data.phone.map((p, index) => (
                          <p key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">{p.type}:</span>
                            <a href={`tel:${p.number}`} className="text-blue-600 hover:text-blue-800">
                              {p.number}
                            </a>
                          </p>
                        ))}
                        {data.address && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Address:</span>
                            {data.address}
                          </p>
                        )}
                        {data.location && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Location:</span>
                            {data.location}
                          </p>
                        )}
                        {data.website && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Website:</span>
                            <a
                              href={data.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              {data.website}
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {(data.days.length > 0 && data.days[0].opening && data.days[0].closing) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h4>
                        <div className="space-y-1">
                          {data.days.map((day, index) => (
                            <p key={index} className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-5 h-5 text-blue-600" />
                              <span className="font-medium">{day.day}:</span>
                              <span>{day.opening} - {day.closing}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Social Medias</h4>
                    <div className="flex flex-wrap gap-3">
                      {data.linkedin && (
                        <a
                          href={data.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                      {data.instagram && (
                        <a
                          href={data.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {data.tiktok && (
                        <a
                          href={data.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          TikTok
                        </a>
                      )}
                      {data.facebook && (
                        <a
                          href={data.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-blue-100 text-lg">
                © {new Date().getFullYear()} {data.name || "[Your Company Name]"}. All rights reserved.
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      {showTextPopup && <TextPopup />}
      {showGalleryPopup && <GalleryPopup />}
      {showFullImage && <FullImagePopup />}

      {/* Add styles for prose content */}
      <style jsx global>{`
        .prose {
          max-width: 65ch;
          color: #374151;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: #1f2937;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose p {
          margin-top: 1.25em;
          margin-bottom: 1.25em;
        }
        .prose a {
          color: #2563eb;
          text-decoration: underline;
        }
        .prose ul, .prose ol {
          margin-top: 1.25em;
          margin-bottom: 1.25em;
          padding-left: 1.625em;
        }
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose blockquote {
          font-style: italic;
          color: #4b5563;
          border-left-width: 0.25rem;
          border-left-color: #e5e7eb;
          padding-left: 1em;
          margin-top: 1.6em;
          margin-bottom: 1.6em;
        }
        .prose img {
          margin-top: 2em;
          margin-bottom: 2em;
          border-radius: 0.375rem;
        }
        .prose code {
          color: #1f2937;
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }
        .prose pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
        }
      `}</style>
    </>
  )
}

export default withAdminAuth(AdminPage)
