'use client'
import API_BASE_URL from '@/config/baseURL'
import axios from 'axios'
import { useState, ChangeEvent, FormEvent } from 'react'
import { toast } from 'react-toastify'
// import { useRouter } from 'next/router'

interface FormData {
  name: string
  email: string
  phone: string
  logo: File | null
}

const RegisterPage = () => {
  // const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    logo: null,
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        logo: e.target.files[0],
      })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)

    const form = new FormData()
    form.append('name', formData.name)
    form.append('email', formData.email)
    form.append('phone', formData.phone)
    if (formData.logo) {
      form.append('logo', formData.logo)
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/institution`, form)
         toast.success(response.data.message)
    } catch (err) {
      if(err.response){
        setError(err.response.data.message)
      }
      else if(err.request){
        setError('failed to connect to server')
      }
      else{
        setError(err.message)

      }
      
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="flex  mx-auto w-full shadow-lg h-full round overflow-hidden">
        <div className="hidden  lg:w-3/5 bg-blue-600 text-white p-8 lg:flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-4">Join Us Today</h2>
          <p className="text-sm mb-6">Become part of a growing community that values learning and innovation. Register now and start your journey with us!</p>
          <img
            src="/hero.jpg" 
            alt="Register Illustration"
            className="w-full h-96 object-cover rounded-lg shadow-md"
          />
        </div>
        <div className="w-full px-20 lg:w-2/5 bg-white py-8">
          <h1 className="text-2xl font-semibold text-center text-blue-600 mb-6">Register Your Institution</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div>
              <label htmlFor="name" className="block text-md font-medium">Institution Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-1 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-md font-medium">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-1 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-md font-medium">Admin  Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-1 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-md font-medium">Company Logo</label>
              <input
                type="file"
                id="logo"
                name="logo"
                accept='.png'
                onChange={handleFileChange}
                required
                className="w-full p-1 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-300"
              >
                {loading ? 'Submitting...' : 'Register'}
              </button>
              <p>Already registered? <a href="/login" className='text-blue-600 hover:text-blue-800'>login</a></p>
            </div>
          </form>
        </div>

     
        
      </div>
  )
}

export default RegisterPage
