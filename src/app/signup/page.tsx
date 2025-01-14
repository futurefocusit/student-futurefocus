'use client'
import { useState, ChangeEvent, FormEvent } from 'react'
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
      const response = await fetch('/api/register', {
        method: 'POST',
        body: form,
      })

      if (response.ok) {
        // router.push('/success') // Redirect on success
      } else {
        throw new Error('Something went wrong')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="flex  mx-auto w-full shadow-lg h-full rounded-lg overflow-hidden">
        <div className="w-full px-36 lg:w-1/2 bg-white p-8">
          <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Register</h1>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}

            <div>
              <label htmlFor="name" className="block text-lg font-medium">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-lg font-medium">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-lg font-medium">Logo</label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleFileChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-300"
              >
                {loading ? 'Submitting...' : 'Register'}
              </button>
            </div>
          </form>
        </div>

     
        <div className="hidden  lg:w-1/2 bg-blue-600 text-white p-8 lg:flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">Join Us Today</h2>
          <p className="text-lg mb-6">Become part of a growing community that values learning and innovation. Register now and start your journey with us!</p>
          <img
            src="/images/register-image.png" // Add an appropriate image here
            alt="Register Illustration"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
  )
}

export default RegisterPage
