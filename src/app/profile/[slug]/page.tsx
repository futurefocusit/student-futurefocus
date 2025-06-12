"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Building2, Target, Eye, TrendingUp, MessageCircle, Loader2, ExternalLink, MapPin, Star } from "lucide-react"
import axios from "axios"
import API_BASE_URL from "@/config/baseURL"
import Header from "@/components/header"

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

export default function CompanyProfilePage() {
  const params = useParams()
  const slug = params?.slug as string

  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response = await axios.get(`${API_BASE_URL}/institution/profile/${slug}`)

        if (response.data) {
          setCompanyData(response.data)
        } else {
          setError("Company profile not found")
        }
      } catch (err) {
        console.error("Error fetching company data:", err)
        setError("Failed to load company profile. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchCompanyData()
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-blue-800 font-medium text-lg">Loading company profile...</p>
          <div className="mt-4 w-32 h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !companyData) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50">
          <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center border border-blue-100">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-400 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-700 mb-8 leading-relaxed">{error || "Company profile not found"}</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Return to Home
            </a>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-yellow-400 opacity-20"></div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-8">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {companyData.name}
              </h1>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400 text-blue-900 rounded-full font-semibold text-lg mb-6">
                <Star className="w-5 h-5 mr-2" />
                Company Profile
              </div>
              {companyData.location && (
                <div className="flex items-center justify-center text-blue-100 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {companyData.location}
                </div>
              )}
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full opacity-10 animate-pulse"></div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            {/* About Us */}
            {companyData.aboutUs && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-800" />
                    </div>
                    About Us
                  </h3>
                </div>
                <div className="px-6 py-8">
                  <p className="text-gray-700 leading-relaxed text-lg">{companyData.aboutUs}</p>
                </div>
              </div>
            )}

            {/* Mission & Vision */}
            {(companyData.mission || companyData.vision) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {companyData.mission && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300 group">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Target className="w-6 h-6 text-blue-800" />
                        </div>
                        Mission
                      </h3>
                    </div>
                    <div className="px-6 py-8">
                      <p className="text-gray-700 leading-relaxed text-lg">{companyData.mission}</p>
                    </div>
                  </div>
                )}

                {companyData.vision && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300 group">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-6">
                      <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        Vision
                      </h3>
                    </div>
                    <div className="px-6 py-8">
                      <p className="text-gray-700 leading-relaxed text-lg">{companyData.vision}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Why Choose Us */}
            {companyData.whyChooseUs && companyData.whyChooseUs.filter((reason) => reason.trim()).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-6">
                  <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    Why Choose Us
                  </h3>
                </div>
                <div className="px-6 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyData.whyChooseUs
                      .filter((reason) => reason.trim())
                      .map((reason, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700 font-medium">{reason}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-800" />
                  </div>
                  Contact Us
                </h3>
              </div>
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {companyData.email && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                      <div className="font-semibold text-blue-800 mb-2">Email</div>
                      <a
                        href={`mailto:${companyData.email}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-300"
                      >
                        {companyData.email}
                      </a>
                    </div>
                  )}

                  {companyData.phone && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100">
                      <div className="font-semibold text-blue-800 mb-2">Phone</div>
                      <a
                        href={`tel:${companyData.phone}`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors duration-300"
                      >
                        {companyData.phone}
                      </a>
                    </div>
                  )}

                  {companyData.website && (
                    <div className="md:col-span-2 p-4 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-xl border border-blue-100">
                      <div className="font-semibold text-blue-800 mb-2">Website</div>
                      <a
                        href={companyData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-2 transition-colors duration-300"
                      >
                        {companyData.website}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {(companyData.linkedin || companyData.instagram || companyData.twitter || companyData.facebook) && (
                  <div>
                    <div className="font-semibold text-blue-800 mb-4 text-lg">Follow Us</div>
                    <div className="flex flex-wrap gap-3">
                      {companyData.linkedin && (
                        <a
                          href={companyData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          LinkedIn
                        </a>
                      )}
                      {companyData.instagram && (
                        <a
                          href={companyData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Instagram
                        </a>
                      )}
                      {companyData.twitter && (
                        <a
                          href={companyData.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          X (Twitter)
                        </a>
                      )}
                      {companyData.facebook && (
                        <a
                          href={companyData.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl mb-6">
                <Building2 className="w-8 h-8 text-blue-800" />
              </div>
              <p className="text-blue-100 text-lg">
                © {new Date().getFullYear()} {companyData.name}. All rights reserved.
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
