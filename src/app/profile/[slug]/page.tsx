"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Building2, Target, Eye, TrendingUp, MessageCircle, Loader2, ExternalLink, MapPin, Star, Clock, Globe, ImageIcon, Home, User, BookOpen, Calendar, MessageSquare } from "lucide-react"
import axiosInstance, { fetchWithCache } from "@/libs/axios"
import API_BASE_URL from "@/config/baseURL"
import Header from "@/components/header"
import Image from "next/image"
import Link from "next/link"

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

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response = await fetchWithCache<CompanyData>(`${API_BASE_URL}/institution/profile/${slug}`)

        if (response) {
          setCompanyData(response)
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

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Profile", href: `/profile/${slug}`, icon: User },
    { name: "Courses", href: `/profile/${slug}/courses`, icon: BookOpen },
    { name: "Events", href: `/profile/${slug}/events`, icon: Calendar },
    { name: "Contact", href: `#contact`, icon: MessageSquare },
  ]

  const sectionItems = [
    { name: "About Us", href: "#about", icon: Building2 },
    { name: "Mission & Vision", href: "#mission-vision", icon: Target },
    { name: "Core Values", href: "#core-values", icon: Star },
    { name: "Gallery", href: "#gallery", icon: ImageIcon },
    { name: "Contact Info", href: "#contact-info", icon: MessageCircle },
  ]

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
                onClick={() => router.push(`/profile/${slug}/contact`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Us
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
                onClick={() => router.push(`/profile/${slug}/contact`)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"
              >
                <MessageSquare className="h-5 w-5" />
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
          {companyData.heroImage && (
            <div className="absolute inset-0">
              <Image
                src={companyData.heroImage}
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
              {companyData.logo && (
                <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-2xl shadow-lg mb-8">
                  <Image
                    src={companyData.logo}
                    alt="Company Logo"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {companyData.name}
              </h1>

              {companyData.location && (
                <div className="flex items-center justify-center text-blue-100 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {companyData.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* About Us */}
            <div id="about" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-800" />
                  </div>
                  About Us
                </h3>
              </div>
              <div className="px-6 py-8">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: companyData.aboutUs }} />
              </div>
            </div>

            {/* Description */}
            {companyData.description && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 max-h-96">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-800" />
                    </div>
                    Description
                  </h3>
                </div>
                <div className="px-6 py-8">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: companyData.description }} />
                </div>
              </div>
            )}

            {/* Mission & Vision */}
            <div id="mission-vision" className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-scroll">
              {companyData.mission && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-800" />
                      </div>
                      Mission
                    </h3>
                  </div>
                  <div className="px-6 py-8">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: companyData.mission }} />
                  </div>
                </div>
              )}

              {companyData.vision && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-800" />
                      </div>
                      Vision
                    </h3>
                  </div>
                  <div className="px-6 py-8">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: companyData.vision }} />
                  </div>
                </div>
              )}
            </div>

            {/* Core Values & Languages */}
            <div id="core-values" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companyData.coreValues.length > 0 && companyData.coreValues[0] && (
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
                      {companyData.coreValues.map((value, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-700">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {companyData.languages.length > 0 && companyData.languages[0] && (
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
                      {companyData.languages.map((language, index) => (
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {companyData.gallery.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div id="contact-info" className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-800" />
                  </div>
                  Contact Information
                </h3>
              </div>
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Contact Details</h4>
                      <div className="space-y-2">
                        {companyData.email && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Email:</span>
                            <a href={`mailto:${companyData.email}`} className="text-blue-600 hover:text-blue-800">
                              {companyData.email}
                            </a>
                          </p>
                        )}
                        {companyData.phone.map((phone, index) => (
                          <p key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Phone {index + 1}:</span>
                            <a href={`tel:${phone}`} className="text-blue-600 hover:text-blue-800">
                              {phone}
                            </a>
                          </p>
                        ))}
                        {companyData.address && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Address:</span>
                            {companyData.address}
                          </p>
                        )}
                        {companyData.website && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Website:</span>
                            <a
                              href={companyData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              {companyData.website}
                              <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {(companyData.opening || companyData.closing) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h4>
                        <p className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-blue-600" />
                          {companyData.opening} - {companyData.closing}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Social Media</h4>
                    <div className="flex flex-wrap gap-3">
                      {companyData.linkedin && (
                        <a
                          href={companyData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          LinkedIn
                        </a>
                      )}
                      {companyData.instagram && (
                        <a
                          href={companyData.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {companyData.tiktok && (
                        <a
                          href={companyData.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          TikTok
                        </a>
                      )}
                      {companyData.facebook && (
                        <a
                          href={companyData.facebook}
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
      </div>
    </>
  )
}
