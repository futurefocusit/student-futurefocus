"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Building2, Target, Eye, TrendingUp, MessageCircle, Loader2, ExternalLink, MapPin, Star, Clock, Globe, ImageIcon, Home, User, BookOpen, Calendar, MessageSquare, X } from "lucide-react"
import axiosInstance, { fetchWithCache } from "@/libs/axios"
import API_BASE_URL from "@/config/baseURL"
import Image from "next/image"
import BlogList from "./BlogList"
import axios from "axios"
import { FaServicestack } from "react-icons/fa"
import { FaHouse } from "react-icons/fa6"

interface CompanyData {
  name: string
  location: string
  coreValues: string[]
  heroImage: string
  address: string
  languages: string[]
  gallery: Array<{ url: string, caption?: string }>
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

interface Service {
  _id: string;
  image: string;
  title: string;
  desc: string;
}

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
    <div className={`space-y-2  ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 rounded-t-xl to-blue-700 px-6 py-6">
<              h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-800" />
                  </div>
        {title}</h3>
        </div>

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

export default function CompanyProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showTextPopup, setShowTextPopup] = useState(false)
  const [showGalleryPopup, setShowGalleryPopup] = useState(false)
  const [showFullImage, setShowFullImage] = useState<string | null>(null)
  const [popupContent, setPopupContent] = useState({ title: "", content: "" })
  const [selectedGallery, setSelectedGallery] = useState<Array<{ url: string, caption?: string }>>([])

  const [companyData, setCompanyData] = useState<CompanyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [expandedServiceIds, setExpandedServiceIds] = useState<string[]>([])

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

    // Fetch services
    const fetchServices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/service/slug/${slug}`);
        setServices(response.data);
      } catch (err) {
       
      }
    };

    if (slug) {
      fetchCompanyData()
      fetchServices()
    }
  }, [slug])

  const toggleExpand = (id: string) => {
    setExpandedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const sectionItems = [
    { name: "About Us", href: "#about", icon: Building2 },
    { name: "Mission & Vision", href: "#mission-vision", icon: Target },
    { name: "Core Values", href: "#core-values", icon: Star },
    { name: "Gallery", href: "#gallery", icon: ImageIcon },
    { name: "Contact Info", href: "#contact-info", icon: MessageCircle },
  ]

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
                onClick={() => router.push(`/profile/${slug}/##contact`)}
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
            <div id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <TextWithReadMore
                  content={companyData.aboutUs}
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
                    content={companyData.mission}
                    title="Mission"
                    maxLength={200}
                  />
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <TextWithReadMore
                    content={companyData.vision}
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
                  content={companyData.description}
                  title="Description"
                  maxLength={400}
                />
              </div>
            </div>

            {/* Why Choose Us */}
            <div id="why-choose-us" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 rounded-t-lg">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <FaHouse className="w-6 h-6 text-blue-800" />
                  </div>
                  Why Choose Us</h3>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                  {companyData.whyChooseUs.map((reason, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg ">
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
                <GallerySection images={companyData.gallery} />
              </div>
            </div>

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
                        {companyData.email && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Email:</span>
                            <a href={`mailto:${companyData.email}`} className="text-blue-600 hover:text-blue-800">
                              {companyData.email}
                            </a>
                          </p>
                        )}
                        {companyData.phone.map((p, index) => (
                          <p key={index} className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">{p.type}:</span>
                            <a href={`tel:${p.number}`} className="text-blue-600 hover:text-blue-800">
                              {p.number}
                            </a>
                          </p>
                        ))}
                        {companyData.address && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Address:</span>
                            {companyData.address}
                          </p>
                        )}
                        {companyData.location && (
                          <p className="flex items-center gap-2 text-gray-700">
                            <span className="font-medium">Address:</span>
                            {companyData.location}
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

                    {(companyData.days.length > 0 && companyData.days[0].opening && companyData.days[0].closing) && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h4>
                        <div className="space-y-1">
                          {companyData.days.map((day, index) => (
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
        {/* Add BlogList at the end of the main content section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <BlogList slug={slug} />
        </div>

        <section className="my-10 max-w-4xl mx-auto">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                    <FaServicestack className="w-6 h-6 text-blue-800" />
                  </div>
          
          Our Services</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="text-2xl overflow-hidden max-h-44">
                  {service.image && (
                    <img src={service.image} alt={service.title} className="h-auto mx-auto object-contain" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-4">{service.title}</h3>
                <div
                  className={`mt-2 prose prose-sm max-w-none transition-all duration-300 ${expandedServiceIds.includes(service._id) ? '' : 'max-h-[150px] overflow-hidden relative'}`}
                  style={{ position: 'relative' }}
                  dangerouslySetInnerHTML={{ __html: service.desc }}
                />
                {service.desc && (
                  <button
                    className="text-blue-600 text-xs mt-1 underline focus:outline-none"
                    onClick={() => toggleExpand(service._id)}
                  >
                    {expandedServiceIds.includes(service._id) ? 'View Less' : 'View More'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-2xl mb-6">
                <Building2 className="w-8 h-8 text-blue-800" />
              </div> */}
              <p className="text-blue-100 text-lg">
                © {new Date().getFullYear()} {companyData.name}. All rights reserved.
              </p>
              <div className="mt-4 w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mx-auto"></div>
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

      {/* Place this where you want the Services section to appear, e.g. after main company info */}
     
    </>
  )
}
