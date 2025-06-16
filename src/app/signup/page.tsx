'use client'
import API_BASE_URL from '@/config/baseURL'
import axios from 'axios'
import { useState, ChangeEvent, FormEvent, useEffect } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import Link from 'next/link'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface FormData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  logo: File | null
  termsAccepted: boolean
}

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  logo?: string
  termsAccepted?: string
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    logo: null,
    termsAccepted: false,
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  useEffect(()=>{
      document.title = "XCOOLL | Register";
  })

  const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage = error.response.data.message || "An error occurred";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Failed to connect to server");
      } else {
        toast.error("Error sending request. Please try again.");
      }
    } else {
      toast.error("An unexpected error occurred");
    }
  };
  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const phoneRegex = /^(078|079|073|072)\d{7}$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if (!formData.name.trim()) {
      errors.name = 'Institution name is required'
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Institution name must be at least 3 characters long'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., example@domain.com)'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Phone number must start with 078, 079, 073, or 072 and be 10 digits long'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.logo) {
      errors.logo = 'Logo is required'
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms and conditions'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type !== 'image/png') {
        setFormErrors({
          ...formErrors,
          logo: 'Only PNG files are allowed',
        })
        return
      }
      setFormData({
        ...formData,
        logo: file,
      })
      setLogoPreview(URL.createObjectURL(file))
      setFormErrors({
        ...formErrors,
        logo: undefined,
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append('name', formData.name)
    form.append('email', formData.email)
    form.append('phone', formData.phone)
    form.append('password', formData.password)
    if (formData.logo) {
      form.append('logo', formData.logo)
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/institution`, form)
      toast.success(response.data.message)
      // Redirect to login page after successful registration
      window.location.href = '/login'
    } catch (err) {
      handleAxiosError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-2">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg overflow-hidden h-[95vh]">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-6">
            <div className="flex flex-col h-full justify-center">
              <h2 className="text-2xl font-bold text-white mb-3">Join Our Educational Community</h2>
              <p className="text-blue-100 mb-4 text-base">
                Register your institution and start providing quality education with our comprehensive platform.
              </p>
              <div className="relative h-40 w-full">
                <Image
                  src="/hero.jpg"
                  alt="Education Illustration"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 p-4 lg:p-6 overflow-y-auto">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Register Your Institution</h1>
              <p className="mt-1 text-sm text-gray-600">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Institution Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                  className={`mt-1 block w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Admin Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0781234567"
                  className={`mt-1 block w-full rounded-md border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${formErrors.password ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base pr-8`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
                <div className="mt-1 text-sm text-gray-500">
                  Password must contain:
                  <ul className="list-disc list-inside">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>One uppercase letter</li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>One lowercase letter</li>
                    <li className={/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>One number</li>
                    <li className={/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-base pr-8`}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Institution Logo (PNG only)
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept=".png"
                    onChange={handleFileChange}
                    className={`block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${formErrors.logo ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {logoPreview && (
                    <div className="relative h-10 w-10">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  )}
                </div>
                {formErrors.logo && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.logo}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                    terms and conditions
                  </Link>
                </label>
              </div>
              {formErrors.termsAccepted && (
                <p className="text-sm text-red-600">{formErrors.termsAccepted}</p>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !formData.termsAccepted}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Register'
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
