'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import API_BASE_URL from '@/config/baseURL'
import { toast } from 'react-toastify'

interface Feature {
    _id: string
    name: string
    description: string
    price: number
}

interface SubscriptionStatus {
    isActive: boolean
    isExpired: boolean
    isGracePeriod: boolean
    daysUntilExpiry: number
    gracePeriodEnd: Date | null
    daysInGracePeriod: number | null
    features: {
        id: string
        name: string
        active: boolean
        expiresAt: Date
    }[]
}

interface Institution {
    _id: string
    name: string
    email: string
    phone: string
    subscriptionStatus: SubscriptionStatus
}

const SubscriptionPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
    const [selectedMonths, setSelectedMonths] = useState(1)
    const [features, setFeatures] = useState<Feature[]>([])
    const [totalAmount, setTotalAmount] = useState(0)
    const [isAdmin, setIsAdmin] = useState(false)
    const [institutions, setInstitutions] = useState<Institution[]>([])
    const [selectedInstitution, setSelectedInstitution] = useState<string>('')

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const adminStatus = localStorage.getItem('isAdmin')
                setIsAdmin(adminStatus === 'true')

                if (adminStatus === 'true') {
                    const response = await axios.get(`${API_BASE_URL}/institutions`)
                    setInstitutions(response.data)
                } else {
                    const institutionId = localStorage.getItem('institutionId')
                    if (!institutionId) {
                        router.push('/login')
                        return
                    }
                    setSelectedInstitution(institutionId)
                }
            } catch (error) {
                toast.error('Failed to verify admin status')
            }
        }

        checkAdminStatus()
    }, [router])

    useEffect(() => {
        const fetchSubscriptionData = async () => {
            if (!selectedInstitution) return

            try {
                // Fetch subscription status
                const statusResponse = await axios.get(`${API_BASE_URL}/subscription/status/${selectedInstitution}`)
                setSubscriptionStatus(statusResponse.data)

                // Fetch available features
                const featuresResponse = await axios.get(`${API_BASE_URL}/features`)
                setFeatures(featuresResponse.data)
            } catch (error) {
                toast.error('Failed to load subscription data')
            } finally {
                setLoading(false)
            }
        }

        fetchSubscriptionData()
    }, [selectedInstitution])

    useEffect(() => {
        // Calculate total amount based on selected features and months
        const amount = selectedFeatures.reduce((total, featureId) => {
            const feature = features.find(f => f._id === featureId)
            return total + (feature?.price || 0) * selectedMonths
        }, 0)
        setTotalAmount(amount)
    }, [selectedFeatures, selectedMonths, features])

    const handleFeatureToggle = (featureId: string) => {
        setSelectedFeatures(prev =>
            prev.includes(featureId)
                ? prev.filter(id => id !== featureId)
                : [...prev, featureId]
        )
    }

    const handleRenewSubscription = async () => {
        try {
            if (!selectedInstitution) {
                toast.error('Please select an institution')
                return
            }

            const response = await axios.post(`${API_BASE_URL}/subscription/renew`, {
                institutionId: selectedInstitution,
                amount: totalAmount,
                months: selectedMonths,
                features: selectedFeatures.map(featureId => ({ featureId }))
            })

            toast.success('Subscription renewed successfully')
            router.refresh()
        } catch (error) {
            toast.error('Failed to renew subscription')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Management</h1>

                    {/* Institution Selection for Admin */}
                    {isAdmin && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Institution
                            </label>
                            <select
                                value={selectedInstitution}
                                onChange={(e) => setSelectedInstitution(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value="">Select an institution</option>
                                {institutions.map(institution => (
                                    <option key={institution._id} value={institution._id}>
                                        {institution.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Current Subscription Status */}
                    {subscriptionStatus && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className="text-lg font-medium">
                                        {subscriptionStatus.isActive && 'Active'}
                                        {subscriptionStatus.isGracePeriod && 'Grace Period'}
                                        {subscriptionStatus.isExpired && 'Expired'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600">Days Until Expiry</p>
                                    <p className="text-lg font-medium">{subscriptionStatus.daysUntilExpiry} days</p>
                                </div>
                                {subscriptionStatus.isGracePeriod && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">Days in Grace Period</p>
                                        <p className="text-lg font-medium">{subscriptionStatus.daysInGracePeriod} days</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active Features */}
                    {subscriptionStatus && subscriptionStatus.features.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subscriptionStatus.features.map(feature => (
                                    <div key={feature.id} className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm font-medium text-gray-900">{feature.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Expires: {new Date(feature.expiresAt).toLocaleDateString()}
                                        </p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${feature.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {feature.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Renewal Section */}
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Renew Subscription</h2>

                        {/* Duration Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subscription Duration
                            </label>
                            <select
                                value={selectedMonths}
                                onChange={(e) => setSelectedMonths(Number(e.target.value))}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value={1}>1 Month</option>
                                <option value={3}>3 Months</option>
                                <option value={6}>6 Months</option>
                                <option value={12}>12 Months</option>
                            </select>
                        </div>

                        {/* Features Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Features
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {features.map(feature => (
                                    <div
                                        key={feature._id}
                                        className={`p-4 border rounded-lg cursor-pointer ${selectedFeatures.includes(feature._id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => handleFeatureToggle(feature._id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                                                <p className="text-sm text-gray-500">{feature.description}</p>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                ${feature.price}/month
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total Amount */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">Total Amount</span>
                                <span className="text-lg font-bold text-gray-900">${totalAmount}</span>
                            </div>
                        </div>

                        {/* Renew Button */}
                        <button
                            onClick={handleRenewSubscription}
                            disabled={selectedFeatures.length === 0 || !selectedInstitution}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Renew Subscription
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionPage 